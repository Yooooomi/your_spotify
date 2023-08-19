import { AxiosError, AxiosInstance } from 'axios';
import { Types } from 'mongoose';
import { getUserFromField, storeInUser } from '../../database';
import { SpotifyTrack } from '../../database/schemas/track';
import { logger } from '../logger';
import { chunk, wait } from '../misc';
import { Spotify } from '../oauth/Provider';
import { PromiseQueue } from '../queue';

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
    const user = await getUserFromField('_id', new Types.ObjectId(this.userId));
    let access: string | null | undefined = user?.accessToken;
    if (!user) {
      throw new Error('User not found');
    }
    if (!user.spotifyId) {
      throw new Error('User has no spotify id');
    }
    this.spotifyId = user.spotifyId;
    if (Date.now() > user.expiresIn - 1000 * 120) {
      const token = user.refreshToken;
      if (!token) {
        return null;
      }
      const infos = await Spotify.refresh(token);

      await storeInUser('_id', user._id, infos);
      logger.info(`Refreshed token for ${user.username}`);
      access = infos.accessToken;
    }
    if (access) {
      this.client = Spotify.getHttpClient(access);
    } else {
      throw new Error('Could not get any access token');
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
      return this.client.put('https://api.spotify.com/v1/me/player/play', {
        uris: [trackUri],
      });
    });
  }

  public async addToQueue(trackUri: string) {
    await squeue.queue(async () => {
      await this.checkToken();
      return this.client.post(
        `https://api.spotify.com/v1/me/player/queue?uri=${trackUri}`,
      );
    });
  }

  public async me() {
    const res = await squeue.queue(async () => {
      await this.checkToken();
      return this.client.get('/me');
    });
    return res.data as SpotifyMe;
  }

  public async playlists() {
    const items: SpotifyPlaylist[] = [];

    let nextUrl = '/me/playlists?limit=50';
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

  private async internAddToPlaylist(id: string, ids: string[]) {
    const chunks = chunk(ids, 100);
    for (let i = 0; i < chunks.length; i += 1) {
      const chk = chunks[i];
      // eslint-disable-next-line no-await-in-loop
      await this.client.post(`/playlists/${id}/tracks`, {
        uris: chk.map(trackId => `spotify:track:${trackId}`),
      });
      if (i !== chunks.length - 1) {
        // Cannot queue inside queue, will cause infinite wait
        // eslint-disable-next-line no-await-in-loop
        await wait(1000);
      }
    }
  }

  public async addToPlaylist(id: string, ids: string[]) {
    await squeue.queue(async () => {
      await this.checkToken();
      return this.internAddToPlaylist(id, ids);
    });
  }

  public async createPlaylist(name: string, ids: string[]) {
    await squeue.queue(async () => {
      await this.checkToken();
      const { data } = await this.client.post(
        `/users/${this.spotifyId}/playlists`,
        {
          name,
          public: true,
          collaborative: false,
          description: '',
        },
      );
      return this.internAddToPlaylist(data.id, ids);
    });
  }

  async getTracksFromIds(spotifyIds: string[]) {
    const res = await squeue.queue(async () => {
      await this.checkToken();
      return this.client.get(`/tracks?ids=${spotifyIds.join(',')}`);
    });

    return res.data.tracks as SpotifyTrack[];
  }

  public async search(track: string, artist: string) {
    try {
      const res = await squeue.queue(async () => {
        await this.checkToken();
        return this.client.get(
          `/search?q=track:${encodeURIComponent(
            track,
          )}+artist:${encodeURIComponent(artist)}&type=track&limit=10`,
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
