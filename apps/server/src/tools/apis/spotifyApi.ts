import axios, { AxiosInstance } from "axios";
import { Types } from "mongoose";
import { getUserFromField } from "../../database";
import { SpotifyTrack } from "../../database/schemas/track";
import { getWithDefault } from "../env";
import { PromiseQueue } from "../queue";
import { SpotifyAlbum } from "../../database/schemas/album";
import { SpotifyArtist } from "../../database/schemas/artist";
import { getWithDefault } from "../env";

export const squeue = new PromiseQueue(getWithDefault("SPOTIFY_API_DELAY_MS", 2000));

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

	constructor(private readonly userId: string) {}

private async prepareClient() {
    const user = await getUserFromField(
      "_id",
      new Types.ObjectId(this.userId),
      true,
    );
    if (!user) {
      throw new Error("User not found");
    }
    if (!user.spotifyId) {
      throw new Error("User has no spotify id");
    }

    const accessToken = user.accessToken;
    const refreshToken = user.refreshToken;
    const proxyEndpoint = getWithDefault(
      "SPOTIPY_PROXY_ENDPOINT",
      "http://localhost:5000",
    );
    const headers: Record<string, string> = {};

    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }
    if (refreshToken) {
      headers["X-Spotify-Refresh-Token"] = refreshToken;
    }

    this.client = axios.create({
      baseURL: proxyEndpoint,
      headers,
    });
	}

	public async recentlyPlayed(url?: string) {
		const res = await squeue.queue(async () => {
      await this.prepareClient();
      const params: any = {};
      
      if (url) {
        // Parse URL parameters like /me/player/recently-played?after=123&limit=50
        const urlObj = new URL(url, 'https://api.spotify.com');
        const after = urlObj.searchParams.get('after');
        const limit = urlObj.searchParams.get('limit');
        if (after) params.after = after;
        if (limit) params.limit = limit;
      }
      
      return this.client.get("/api/recentlyPlayed", { params });
    });

    return res;
  }

  public async playTrack(trackUri: string) {
    await squeue.queue(async () => {
      await this.prepareClient();
      return this.client.post("/api/play", {
        track_uri: trackUri,
      });
    });
  }

  public async me() {
    const res = await squeue.queue(async () => {
      await this.prepareClient();
      return this.client.get("/api/me");
    });
    return res.data as SpotifyMe;
  }

  public async playlists() {
    const res = await squeue.queue(async () => {
      await this.prepareClient();
      return this.client.get("/api/playlists");
    });
    return res.data.items as SpotifyPlaylist[];
  }

  public async addToPlaylist(id: string, ids: string[]) {
    await squeue.queue(async () => {
      await this.prepareClient();
      return this.client.post(`/api/playlists/${id}/tracks`, {
        ids,
      });
    });
  }

  public async createPlaylist(name: string, ids: string[]) {
    await squeue.queue(async () => {
      await this.prepareClient();
      return this.client.post(`/api/playlists`, {
        name,
        ids,
      });
    });
  }

  async getTrack(id: string) {
    try {
      const res = await squeue.queue(async () => {
        await this.prepareClient();
        return this.client.get(`/api/tracks/${id}`);
      });
      return res.data as SpotifyTrack;
    } catch {
      return undefined;
    }
  }

  async getTracks(spotifyIds: string[]) {
    try {
      const res = await squeue.queue(async () => {
        await this.prepareClient();
        return this.client.get(`/api/tracks`, {
          params: { ids: spotifyIds.join(",") },
        });
      });
      return res.data as Array<SpotifyTrack | undefined>;
    } catch {
      return spotifyIds.map(() => undefined);
    }
  }

  async getAlbum(id: string) {
    try {
      const res = await squeue.queue(async () => {
        await this.prepareClient();
        return this.client.get(`/api/albums/${id}`);
      });
      return res.data as SpotifyAlbum;
    } catch {
      return undefined;
    }
  }

  async getAlbums(spotifyIds: string[]) {
    try {
      const res = await squeue.queue(async () => {
        await this.prepareClient();
        return this.client.get(`/api/albums`, {
          params: { ids: spotifyIds.join(",") },
        });
      });
      return res.data as Array<SpotifyAlbum | undefined>;
    } catch {
      return spotifyIds.map(() => undefined);
    }
  }

  async getArtist(id: string) {
    try {
      const res = await squeue.queue(async () => {
        await this.prepareClient();
        return this.client.get(`/api/artists/${id}`);
      });
      return res.data as SpotifyArtist;
    } catch {
      return undefined;
    }
  }

  async getArtists(spotifyIds: string[]) {
    try {
      const res = await squeue.queue(async () => {
        await this.prepareClient();
        return this.client.get(`/api/artists`, {
          params: { ids: spotifyIds.join(",") },
        });
      });
      return res.data as Array<SpotifyArtist | undefined>;
    } catch {
      return spotifyIds.map(() => undefined);
    }
  }

  public async search(track: string, artist: string) {
    try {
      const res = await squeue.queue(async () => {
        await this.prepareClient();
        return this.client.get(`/api/search`, {
          params: {
            track: track.slice(0, 100),
            artist: artist.slice(0, 100),
          },
        });
      });
      return res.data as SpotifyTrack;
    } catch (e: any) {
      if (axios.isAxiosError(e)) {
        if (e.response?.status === 404) {
          return undefined;
        }
      }
      throw e;
    }
  }
}
