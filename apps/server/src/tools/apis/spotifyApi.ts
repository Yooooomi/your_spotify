import { AxiosError, AxiosInstance } from "axios";
import { Types } from "mongoose";
import { getUserFromField, storeInUser } from "../../database";
import { PlaylistTrack, SavedTrack, SpotifyTrack } from "../../database/schemas/track";
import { logger } from "../logger";
import { chunk, retryPromise, wait } from "../misc";
import { Spotify } from "../oauth/Provider";
import { PromiseQueue } from "../queue";
import { User } from "../../database/schemas/user";
import { promises as fs } from "fs";

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
  tracks: {
    total: number;
  };
}

export class SpotifyAPI {
  private client!: AxiosInstance;

  private spotifyId!: string;

  constructor(private readonly userId: string) { }

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

  public async getPlaylist(playlistId: string) {
    const res = await squeue.queue(async () => {
      await this.checkToken();
      return this.client.get(`/playlists/${playlistId}`);
    });
    return res.data as SpotifyPlaylist;
  }

  private async internAddToPlaylist(playlistId: string, ids: string[], position?: number) {
    let chunks = chunk(ids, 100);
    chunks = chunks.reverse();

    for (let i = 0; i < chunks.length; i += 1) {
      const chk = chunks[i]!;
      const body: any = {
        uris: chk.map(trackId => `spotify:track:${trackId}`),
      };
      if (position !== undefined) {
        body.position = position;
      }
      // eslint-disable-next-line no-await-in-loop
      await retryPromise(() => this.client.post(`/playlists/${playlistId}/tracks`, body), 3, 2);
      if (i !== chunks.length - 1) {
        // Cannot queue inside queue, will cause infinite wait
        // eslint-disable-next-line no-await-in-loop
        await wait(1000);
      }
    }
  }

  public async addToPlaylist(playlistId: string, ids: string[], position?: number) {
    await squeue.queue(async () => {
      await this.checkToken();
      return this.internAddToPlaylist(playlistId, ids, position);
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

  async createSyncLikedSongsPlaylist(username: string): Promise<string> {
    const name = `Liked songs • ${username}`;
    let playlistId;
    playlistId = await this.createPlaylist(name, [], false);
    try {
      const coverImageBase64 = (await fs.readFile(__dirname + "/../../public/liked-songs-icon-base64.txt", { encoding: "utf-8" }));
      await this.putPlaylistCoverImage(playlistId, coverImageBase64.replace('"', ""));
    } catch (error) {
      logger.error("spotifyApi.ts createSyncLikedSongsPlaylist() playlist set cover image error: ", error);
    }
    return playlistId;
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

  async getUsersSavedTrackTotal(): Promise<number> {
    try {
      const res = await squeue.queue(async () => {
        await this.checkToken();
        return this.client.get("/me/tracks");
      });
      return res.data.total;
    } catch (e) {
      logger.error(e);
      return 0;
    }
  }

  async updatePlaylistTracks(
    playlist_id: string,
    uris: string[],
    range_start?: number,
    insert_before?: number,
    range_length?: number,
    snapshot_id?: string
  ): Promise<string> {
    const url = `/playlists/${playlist_id}/tracks`;
    const chunks = chunk(uris, 100);

    let latest_snapshot_id = snapshot_id;

    for (const chunk of chunks) {
      const body: any = {};
      if (chunk) body.uris = chunk;
      if (range_start !== undefined) body.range_start = range_start;
      if (insert_before !== undefined) body.insert_before = insert_before;
      if (range_length !== undefined) body.range_length = range_length;
      if (latest_snapshot_id !== undefined) body.snapshot_id = latest_snapshot_id;

      const res = await squeue.queue(async () => {
        await this.checkToken();
        return this.client.put(url, body);
      });

      latest_snapshot_id = res.data.snapshot_id;
    }

    if (!latest_snapshot_id) {
      throw new Error("No snapshot_id returned");
    }

    return latest_snapshot_id;
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

  async syncLikedTracks(user: User): Promise<any> {
    try {
      if (user.syncLikedSongsStatus === "loading") return { status: 200, message: "Already loading" };
      else if (user.syncLikedSongsStatus === "inactive") return { status: 400, message: "Sync is inactive" };

      let likedSongsPlaylistId = user.syncLikedSongsPlaylistId;
      await storeInUser("_id", user._id, { syncLikedSongsStatus: "loading" });

      try {
        let allPlaylists = await this.playlists();
        if (!likedSongsPlaylistId || !allPlaylists.some(playlist => playlist.id === likedSongsPlaylistId)) {
          likedSongsPlaylistId = await this.createSyncLikedSongsPlaylist(user.username);
          await storeInUser("_id", user._id, { syncLikedSongsPlaylistId: likedSongsPlaylistId });
          logger.info(`Created new playlist with ID ${likedSongsPlaylistId}`);
        }
      } catch (error) {
        logger.error("spotifyApi.ts syncLikedTracks() playlist fetch error: ", error);
        await storeInUser("_id", user._id, { syncLikedSongsStatus: "failed" });
        user.syncLikedSongsStatus = "failed";
        throw error;
      }

      const likedSongs = await this.getUsersSavedTracks();
      const likedSongsIds = likedSongs.map((song: SavedTrack) => song.track.id);

      const currentPlaylistTracks = await this.getPlaylistTracks(likedSongsPlaylistId);
      const currentPlaylistTrackIds = currentPlaylistTracks.map((track: PlaylistTrack) => track.track.id);

      const songsToAdd = likedSongsIds.filter(id => !currentPlaylistTrackIds.includes(id));
      const songsToRemove = currentPlaylistTrackIds.filter(id => !likedSongsIds.includes(id));

      logger.info(`[${user.username}]: Adding ${songsToAdd.length} songs and removing ${songsToRemove.length} songs with a total of ${likedSongsIds.length} liked songs`);

      if (songsToRemove.length > 0) {
        await this.removePlaylistTracks(likedSongsPlaylistId, songsToRemove);
      }

      if (songsToAdd.length > 0) {
        await this.addToPlaylist(likedSongsPlaylistId, songsToAdd, 0);
      }
      await storeInUser("_id", user._id, { syncLikedSongsStatus: "active" });

      return { status: 200 };
    } catch (e) {
      logger.error(e);

      if (user.syncLikedSongsStatus !== "failed") {
        await storeInUser("_id", user._id, { syncLikedSongsStatus: "failed" });
        return this.syncLikedTracks(user);
      }
      return { status: 500, error: e.message };
    }
  }

  async putPlaylistCoverImage(playlistId: string, imageBase64: string) {
    await squeue.queue(async () => {
      await this.checkToken();
      return this.client.put(`/playlists/${playlistId}/images`, imageBase64, {
        headers: {
          'Content-Type': 'image/jpeg',
        },
      });
    });
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
