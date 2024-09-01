import { AxiosError, AxiosInstance } from "axios";
import { Types } from "mongoose";
import { getUserFromField, storeInUser } from "../../database";
import { PlaylistTrack, SavedTrack, SpotifyTrack } from "../../database/schemas/track";
import { logger } from "../logger";
import { chunk, wait } from "../misc";
import { Spotify } from "../oauth/Provider";
import { PromiseQueue } from "../queue";
import { User } from "../../database/schemas/user";

export const squeue = new PromiseQueue();

interface SpotifyMe {
  id: string;
}

interface SpotifyPlaylist {
  id: string;
  name: string;
  owner: {
    id: string;
  };
}

export class SpotifyAPI {
  private client!: AxiosInstance;

  private spotifyId!: string;

  constructor(private readonly userId: string) {}

  private async checkToken() {
    // Refresh the token if it expires in less than two minutes (1000ms * 120)
    const user = await getUserFromField(
      "_id",
      new Types.ObjectId(this.userId),
      true,
    );
    let access: string | null | undefined = user?.accessToken;
    if (!user) {
      throw new Error("User not found");
    }
    if (!user.spotifyId) {
      throw new Error("User has no spotify id");
    }
    this.spotifyId = user.spotifyId;
    if (Date.now() > user.expiresIn - 1000 * 120) {
      const token = user.refreshToken;
      if (!token) {
        return;
      }
      const infos = await Spotify.refresh(token);

      await storeInUser("_id", user._id, infos);
      logger.info(`Refreshed token for ${user.username}`);
      access = infos.accessToken;
    }
    if (access) {
      this.client = Spotify.getHttpClient(access);
    } else {
      throw new Error("Could not get any access token");
    }
  }

  public async raw(url: string) {
    const res = await squeue.queue(async () => {
      await this.checkToken();
      return this.client.get(url);
    });

    return res;
  }

  public async playTrack(trackUri: string) {
    await squeue.queue(async () => {
      await this.checkToken();
      return this.client.put("https://api.spotify.com/v1/me/player/play", {
        uris: [trackUri],
      });
    });
  }

  public async me() {
    const res = await squeue.queue(async () => {
      await this.checkToken();
      return this.client.get("/me");
    });
    return res.data as SpotifyMe;
  }

  public async playlists() {
    const items: SpotifyPlaylist[] = [];

    let nextUrl = "/me/playlists?limit=50";
    while (nextUrl) {
      const thisUrl = nextUrl;
      // eslint-disable-next-line no-await-in-loop
      const res = await squeue.queue(async () => {
        await this.checkToken();
        return this.client.get(thisUrl);
      });
      nextUrl = res.data.next;
      items.push(...res.data.items);
    }
    return items;
  }

  private async internAddToPlaylist(playlistId: string, ids: string[]) {
    const chunks = chunk(ids, 100);
    for (let i = 0; i < chunks.length; i += 1) {
      const chk = chunks[i]!;
      // eslint-disable-next-line no-await-in-loop
      await this.client.post(`/playlists/${playlistId}/tracks`, {
        uris: chk.map(trackId => `spotify:track:${trackId}`),
      });
      if (i !== chunks.length - 1) {
        // Cannot queue inside queue, will cause infinite wait
        // eslint-disable-next-line no-await-in-loop
        await wait(1000);
      }
    }
  }

  public async addToPlaylist(playlistId: string, ids: string[]) {
    await squeue.queue(async () => {
      await this.checkToken();
      return this.internAddToPlaylist(playlistId, ids);
    });
  }

  public async createPlaylist(name: string, ids: string[], publicPlaylist: boolean = true): Promise<string> {
      return await squeue.queue(async () => {
        await this.checkToken();
        const { data } = await this.client.post(
          `/users/${this.spotifyId}/playlists`,
          {
            name,
            public: publicPlaylist,
            collaborative: false,
            description: "",
          },
        );
        await this.internAddToPlaylist(data.id, ids);
        return data.id;
      });
    }

  async getUsersSavedTracks(): Promise<SavedTrack[]> {
    const items: SavedTrack[] = [];
    let nextUrl: string | null = "/me/tracks?limit=50";

    while (nextUrl) {
      const thisUrl: string = nextUrl;
      try {
        // eslint-disable-next-line no-await-in-loop
        const res: { data: { items: SavedTrack[], next: string | null } } = await squeue.queue(async (): Promise<{ data: { items: SavedTrack[], next: string | null } }> => {
          await this.checkToken();
          return this.client.get(thisUrl);
        });
        items.push(...res.data.items);
        nextUrl = res.data.next;
      } catch (error) {
        console.error("Error fetching user's saved tracks:", error);
        break;
      }
    }

    return items;
  }

  async getPlaylistTracks(playlistId: string): Promise<PlaylistTrack[]> {
    const items: PlaylistTrack[] = [];

    let nextUrl = `/playlists/${playlistId}/tracks?limit=50`;
    while (nextUrl) {
      const thisUrl = nextUrl;
      // eslint-disable-next-line no-await-in-loop
      const res = await squeue.queue(async () => {
        await this.checkToken();
        return this.client.get(thisUrl);
      });
      nextUrl = res.data.next;
      items.push(...res.data.items);
    }
    return items;
  }

  async removePlaylistTracks(playlistId: string, ids: string[]) {
    const chunks = chunk(ids, 100);
    for (let i = 0; i < chunks.length; i += 1) {
      const chk = chunks[i]!;
      // eslint-disable-next-line no-await-in-loop
      await this.client.delete(`/playlists/${playlistId}/tracks`, {
        data: { tracks: chk.map(trackId => ({ uri: `spotify:track:${trackId}` })) },
      });
      if (i !== chunks.length - 1) {
        // Cannot queue inside queue, will cause infinite wait
        // eslint-disable-next-line no-await-in-loop
        await wait(1000);
      }
    }
  }

  async syncLikedTracks(user: User) {
    try {
      const usersPlaylist = await this.playlists();

      let likedSongsPlaylistId = usersPlaylist.find(playlist => playlist.name === "Liked songs • " + user.username)?.id;
      if (!likedSongsPlaylistId) {
        likedSongsPlaylistId = await this.createPlaylist("Liked songs • " + user.username, [], false);
      }

      const likedSongs = await this.getUsersSavedTracks();
      const likedSongsIds = likedSongs.map((song: SavedTrack) => song.track.id);

      const currentPlaylistTracks = await this.getPlaylistTracks(likedSongsPlaylistId);
      const currentPlaylistTrackIds = currentPlaylistTracks.map((track: PlaylistTrack) => track.track.id);

      const songsToAdd = likedSongsIds.filter(id => !currentPlaylistTrackIds.includes(id));
      const songsToRemove = currentPlaylistTrackIds.filter(id => !likedSongsIds.includes(id));

      if (songsToRemove.length > 0) {
        await this.removePlaylistTracks(likedSongsPlaylistId, songsToRemove);
      }

      if (songsToAdd.length > 0) {
        await this.addToPlaylist(likedSongsPlaylistId, songsToAdd);
      }

      return { status: 200 };
    } catch (e) {
      logger.error(e);
      return { status: 500, error: e.message };
    }
  }

  async getTracks(spotifyIds: string[]) {
    const res = await squeue.queue(async () => {
      await this.checkToken();
      return this.client.get(`/tracks?ids=${spotifyIds.join(",")}`);
    });

    return res.data.tracks as SpotifyTrack[];
  }

  public async search(track: string, artist: string) {
    try {
      const res = await squeue.queue(async () => {
        await this.checkToken();
        const limitedTrack = track.slice(0, 100);
        const limitedArtist = artist.slice(0, 100);
        return this.client.get(
          `/search?q=track:${encodeURIComponent(
            limitedTrack,
          )}+artist:${encodeURIComponent(limitedArtist)}&type=track&limit=10`,
        );
      });
      return res.data.tracks.items[0] as SpotifyTrack;
    } catch (e) {
      if (e instanceof AxiosError) {
        if (e.response?.status === 404) {
          return undefined;
        }
      }
      throw e;
    }
  }
}
