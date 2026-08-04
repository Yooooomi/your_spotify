import { Types } from "mongoose";

import { getUserFromField, storeInUser } from "../../database";
import { SpotifyAlbum } from "../../database/schemas/album";
import { SpotifyArtist } from "../../database/schemas/artist";
import { SpotifyTrack } from "../../database/schemas/track";
import { SpotifyReauthRequiredError } from "../errors/Spotify";
import { logger } from "../logger";
import { chunk } from "../misc";
import { spotifyProvider } from "../oauth/Provider";
import { HttpError } from "./queueHttpClient";

export interface SpotifyMe {
  id: string;
  display_name: string;
}

interface SpotifyPlaylist {
  id: string;
  name: string;
  owner: { id: string };
}

export class SpotifyAPI {
  constructor(private readonly userId: string) {}

  // The account cannot authenticate on its own anymore. Discard what is left
  // and flag it, so the client knows to ask for a Spotify reconnection.
  private async requireReauth(userId: Types.ObjectId, username: string) {
    await storeInUser("_id", userId, {
      accessToken: null,
      refreshToken: null,
      spotifyReauthRequired: true,
    });
    return new SpotifyReauthRequiredError(username);
  }

  private async checkToken() {
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
    // Refresh the token if it expires in less than two minutes (1000ms * 120).
    // A missing access token also goes through the refresh, so a still valid
    // refresh token is used instead of being discarded further down.
    if (!access || Date.now() > user.expiresIn - 1000 * 120) {
      const token = user.refreshToken;
      if (!token) {
        // Nothing left to refresh with, which is how accounts that were
        // discarded before the flag existed present themselves.
        throw await this.requireReauth(user._id, user.username);
      }
      let infos;
      try {
        infos = await spotifyProvider.refresh(token);
      } catch (e) {
        if (
          e instanceof HttpError &&
          e.status === 400 &&
          e.body.includes("invalid_grant")
        ) {
          // Spotify expires refresh tokens six months after the authorization
          // and asks us to discard them instead of retrying.
          throw await this.requireReauth(user._id, user.username);
        }
        throw e;
      }

      await storeInUser("_id", user._id, infos);
      logger.info(`Refreshed token for ${user.username}`);
      access = infos.accessToken;
    }
    if (!access) {
      throw await this.requireReauth(user._id, user.username);
    }
    return spotifyProvider.getHttpClient(access);
  }

  public async raw(url: string) {
    const client = await this.checkToken();
    return client.get(url);
  }

  public async playTrack(trackUri: string) {
    const client = await this.checkToken();
    return client.put("/me/player/play", { data: { uris: [trackUri] } });
  }

  public async me() {
    const client = await this.checkToken();
    const res = await client.get("/me", { priority: "high" });
    return res.data as SpotifyMe;
  }

  public async playlists() {
    const items: SpotifyPlaylist[] = [];

    let nextUrl = "/me/playlists?limit=50";
    while (nextUrl) {
      const thisUrl = nextUrl;

      const client = await this.checkToken();
      const res = await client.get(thisUrl);
      nextUrl = res.data.next;
      items.push(...res.data.items);
    }
    return items;
  }

  private async handleAddIdsToPlaylist(id: string, ids: string[]) {
    const chunks = chunk(ids, 100);
    for (let i = 0; i < chunks.length; i += 1) {
      const chk = chunks[i]!;

      const client = await this.checkToken();
      await client.post(`/playlists/${id}/tracks`, {
        data: { uris: chk.map((trackId) => `spotify:track:${trackId}`) },
      });
    }
  }

  public async addToPlaylist(id: string, ids: string[]) {
    await this.checkToken();
    return this.handleAddIdsToPlaylist(id, ids);
  }

  public async createPlaylist(name: string, ids: string[]) {
    const client = await this.checkToken();
    const { data } = await client.post(`/me/playlists`, {
      data: { name, public: true, collaborative: false, description: "" },
    });
    return this.handleAddIdsToPlaylist(data.id, ids);
  }

  async getTrack(id: string) {
    try {
      const client = await this.checkToken();
      const res = await client.get(`/tracks/${id}`);
      return res.data as SpotifyTrack;
    } catch {
      return undefined;
    }
  }

  async getTracks(spotifyIds: string[]) {
    const tracks: (SpotifyTrack | undefined)[] = [];
    for (const id of spotifyIds) {
      const track = await this.getTrack(id);
      tracks.push(track);
    }
    return tracks;
  }

  async getAlbum(id: string) {
    try {
      const client = await this.checkToken();
      const res = await client.get(`/albums/${id}`);
      return res.data as SpotifyAlbum;
    } catch {
      return undefined;
    }
  }

  async getAlbums(spotifyIds: string[]) {
    const albums: (SpotifyAlbum | undefined)[] = [];
    for (const id of spotifyIds) {
      const album = await this.getAlbum(id);
      albums.push(album);
    }
    return albums;
  }

  async getArtist(id: string) {
    try {
      const client = await this.checkToken();
      const res = await client.get(`/artists/${id}`);
      return res.data as SpotifyArtist;
    } catch {
      return undefined;
    }
  }

  async getArtists(spotifyIds: string[]) {
    const artists: (SpotifyArtist | undefined)[] = [];
    for (const id of spotifyIds) {
      const artist = await this.getArtist(id);
      artists.push(artist);
    }
    return artists;
  }

  public async search(track: string, artist: string) {
    try {
      const client = await this.checkToken();
      const limitedTrack = track.slice(0, 100);
      const limitedArtist = artist.slice(0, 100);
      const res = await client.get(
        `/search?q=track:${encodeURIComponent(
          limitedTrack,
        )}+artist:${encodeURIComponent(limitedArtist)}&type=track&limit=10`,
      );
      return res.data.tracks.items[0] as SpotifyTrack;
    } catch (e) {
      if (e instanceof HttpError) {
        if (e.status === 404) {
          return undefined;
        }
      }
      throw e;
    }
  }
}
