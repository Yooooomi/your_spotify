/* eslint-disable @typescript-eslint/no-use-before-define */
import Axios from 'axios';
import { AdminAccount } from './redux/modules/admin/reducer';
import { ImporterState } from './redux/modules/import/types';
import { User } from './redux/modules/user/types';
import {
  Album,
  Artist,
  DateId,
  GlobalPreferences,
  Timesplit,
  Track,
  TrackWithAlbum,
  TrackInfo,
  TrackInfoWithTrack,
  SpotifyMe,
  CollaborativeMode,
} from './types';

const axios = Axios.create({
  /* @ts-ignore-next-line */
  baseURL: window.API_ENDPOINT,
  withCredentials: true,
});

// Adds latency to requests without having to use chrome latency
// const get = <T>(url: string, params: Record<string, any> = {}): Promise<{ data: T }> =>
//   new Promise((res, rej) => {
//     setTimeout(() => axios.get(url, { params }).then(res).catch(rej), 1000);
//   });

// const post = <T>(url: string, params: Record<string, any> = {}): Promise<{ data: T }> =>
//   new Promise((res, rej) => {
//     setTimeout(() => axios.post(url, params).then(res).catch(rej), 1000);
//   });

// const get = <T>(url: string, params: Record<string, any> = {}): Promise<{ data: T }> =>
//   axios.get(`${url}${api.publicToken ? `?token=${api.publicToken}` : ''}`, { params });

// const post = <T>(url: string, params: Record<string, any> = {}): Promise<{ data: T }> =>
//   axios.post(`${url}${api.publicToken ? `?token=${api.publicToken}` : ''}`, params);

// const put = <T>(url: string, params: Record<string, any> = {}): Promise<{ data: T }> =>
//   axios.put(`${url}${api.publicToken ? `?token=${api.publicToken}` : ''}`, params);

// const delet = <T>(url: string, params: Record<string, any> = {}): Promise<{ data: T }> =>
//   axios.delete(`${url}${api.publicToken ? `?token=${api.publicToken}` : ''}`, params);

const get = <T>(
  url: string,
  params: Record<string, any> = {},
): Promise<{ data: T }> =>
  axios.get(url, { params: { ...params, token: api.publicToken } });

const post = <T>(
  url: string,
  params: Record<string, any> = {},
): Promise<{ data: T }> =>
  axios.post(url, params, {
    params: {
      token: api.publicToken,
    },
  });

const put = <T>(
  url: string,
  params: Record<string, any> = {},
): Promise<{ data: T }> =>
  axios.put(url, params, {
    params: { token: api.publicToken },
  });

const delet = <T>(
  url: string,
  params: Record<string, any> = {},
): Promise<{ data: T }> =>
  axios.delete(url, {
    params: {
      ...params,
      token: api.publicToken,
    },
  });

export type ArtistStatsResponse = {
  artist: Artist;
  bestPeriod: {
    _id: DateId;
    artist: {
      _id: string;
      artistInfos: {
        _id: string;
        trackId: string;
        artistId: string;
      };
      year: number;
      month: number;
      day: number;
      week: number;
      hour: number;
    };
    count: number;
    total: number;
  }[];
  firstLast: {
    first: TrackInfo & {
      artistInfos: {
        _id: string;
        trackId: string;
        artistId: string;
      };
      track: TrackWithAlbum;
    };
    last: TrackInfo & {
      artistInfos: {
        _id: string;
        trackId: string;
        artistId: string;
      };
      track: TrackWithAlbum;
    };
  };
  mostListened: {
    _id: string;
    count: number;
    track: TrackWithAlbum;
  }[];
  rank: {
    index: number;
    isMax: boolean;
    isMin: boolean;
    results: {
      id: string;
      count: number;
    }[];
  };
  total: {
    count: number;
  };
  dayRepartition: {
    _id: number;
    count: number;
    duration: number;
  }[];
};

export const api = {
  publicToken: null as string | null,

  spotify: () => get('/oauth/spotify'),
  logout: () => axios.post('/logout'),
  me: () => get<{ status: true; user: User } | { status: false }>('/me'),
  sme: () => get<SpotifyMe>('/oauth/spotify/me'),
  globalPreferences: () => get<GlobalPreferences>('/global/preferences'),
  rename: (newName: string) => put('/rename', { newName }),
  getAccounts: () => get<AdminAccount[]>('/accounts'),
  setAdmin: (id: string, status: boolean) =>
    put(`/admin/${id}`, {
      status,
    }),
  deleteUser: (id: string) => delet(`/account/${id}`),
  setGlobalPreferences: (preferences: GlobalPreferences) =>
    post<GlobalPreferences>('/global/preferences', preferences),
  play: (id: string) =>
    axios.post('/spotify/play', {
      id,
    }),
  getTracks: (number: number, offset: number, start?: Date, end?: Date) =>
    get<TrackInfoWithTrack[]>('/spotify/gethistory', {
      number,
      offset,
      start,
      end,
    }),
  mostListened: (start: Date, end: Date, timeSplit: Timesplit) =>
    get<{ tracks: TrackWithAlbum[]; counts: number[] }[]>(
      '/spotify/most_listened',
      {
        start,
        end,
        timeSplit,
      },
    ),
  mostListenedArtist: (start: Date, end: Date, timeSplit: Timesplit) =>
    get<{ _id: DateId | undefined; artists: Artist[]; counts: number[] }[]>(
      '/spotify/most_listened_artist',
      {
        start,
        end,
        timeSplit,
      },
    ),
  listened_to: (start: Date, end: Date) =>
    get('/spotify/listened_to', {
      start,
      end,
    }),
  songsPer: (start: Date, end: Date, timeSplit: Timesplit) =>
    get<{ count: number; _id: DateId | null; differents: number }[]>(
      '/spotify/songs_per',
      {
        start,
        end,
        timeSplit,
      },
    ),
  timePer: (start: Date, end: Date, timeSplit: Timesplit) =>
    get<{ count: number; _id: DateId | null }[]>('/spotify/time_per', {
      start,
      end,
      timeSplit,
    }),
  featRatio: (start: Date, end: Date, timeSplit: Timesplit) =>
    get<
      {
        0: number;
        1: number;
        2: number;
        3: number;
        4: number;
        5: number;
        average: number;
        count: number;
        totalPeople: number;
        _id: DateId | null;
      }[]
    >('/spotify/feat_ratio', {
      start,
      end,
      timeSplit,
    }),
  albumDateRatio: (start: Date, end: Date, timeSplit: Timesplit) =>
    get<{ count: number; totalYear: number; _id: DateId | null }[]>(
      '/spotify/album_date_ratio',
      {
        start,
        end,
        timeSplit,
      },
    ),
  popularityPer: (start: Date, end: Date, timeSplit: Timesplit) =>
    get<{ count: number; totalPopularity: number; _id: DateId | null }[]>(
      '/spotify/popularity_per',
      {
        start,
        end,
        timeSplit,
      },
    ),
  bestArtistsPer: (start: Date, end: Date, timeSplit: Timesplit) =>
    get<{ artists: Artist[]; counts: number[]; _id: DateId | null }[]>(
      '/spotify/best_artists_per',
      {
        start,
        end,
        timeSplit,
      },
    ),
  differentArtistsPer: (start: Date, end: Date, timeSplit: Timesplit) =>
    get<
      {
        artists: Artist[];
        counts: number[];
        differents: number;
        _id: DateId | null;
      }[]
    >('/spotify/different_artists_per', {
      start,
      end,
      timeSplit,
    }),
  setSetting: (settingName: string, settingValue: any) =>
    axios.post('/settings', {
      [settingName]: settingValue,
    }),
  timePerHourOfDay: (start: Date, end: Date) =>
    get<
      {
        // _id is the hour of the day
        _id: number;
        count: number;
      }[]
    >('/spotify/time_per_hour_of_day', {
      start,
      end,
    }),
  getArtists: (ids: string[]) => get<Artist[]>(`/artist/${ids.join(',')}`),
  getArtistStats: (id: string) =>
    get<ArtistStatsResponse | { code: 'NEVER_LISTENED' }>(
      `/artist/${id}/stats`,
    ),
  searchArtists: (str: string) => get<Artist[]>(`/artist/search/${str}`),
  getBestSongs: (start: Date, end: Date, nb: number, offset: number) =>
    get<
      {
        count: number;
        duration_ms: number;
        total_count: number;
        total_duration_ms: number;
        album: Album;
        artist: Artist;
        track: Track;
      }[]
    >('/spotify/top/songs', {
      start,
      end,
      nb,
      offset,
    }),
  getBestArtists: (start: Date, end: Date, nb: number, offset: number) =>
    get<
      {
        count: number;
        duration_ms: number;
        total_count: number;
        total_duration_ms: number;
        artist: Artist;
        differents: number;
      }[]
    >('/spotify/top/artists', {
      start,
      end,
      nb,
      offset,
    }),
  getBestAlbums: (start: Date, end: Date, nb: number, offset: number) =>
    get<
      {
        count: number;
        duration_ms: number;
        total_count: number;
        total_duration_ms: number;
        artist: Artist;
        album: Album;
      }[]
    >('/spotify/top/albums', {
      start,
      end,
      nb,
      offset,
    }),
  getImports: () => get<ImporterState[]>('/imports'),
  doImportPrivacy: (files: File[]) => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('imports', file);
    });
    return axios.post('/import/privacy', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  doImportFullPrivacy: (files: File[]) => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('imports', file);
    });
    return axios.post('/import/full-privacy', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  retryImport: (existingStateId: string) =>
    post('/import/retry', {
      existingStateId,
    }),
  cleanupImport: (id: string) => delet(`/import/clean/${id}`),
  collaborativeBestSongs: (
    ids: string[],
    start: Date,
    end: Date,
    mode: CollaborativeMode,
  ) =>
    get<
      ({ track: Track; album: Album; artist: Artist } & Record<
        string,
        number
      >)[]
    >('/spotify/collaborative/top/songs', {
      otherIds: ids,
      start,
      end,
      mode,
    }),
  collaborativeBestAlbums: (
    ids: string[],
    start: Date,
    end: Date,
    mode: CollaborativeMode,
  ) =>
    get<({ album: Album; artist: Artist } & Record<string, number>)[]>(
      '/spotify/collaborative/top/albums',
      {
        otherIds: ids,
        start,
        end,
        mode,
      },
    ),
  collaborativeBestArtists: (
    ids: string[],
    start: Date,
    end: Date,
    mode: CollaborativeMode,
  ) =>
    get<({ artist: Artist } & Record<string, number>)[]>(
      '/spotify/collaborative/top/artists',
      {
        otherIds: ids,
        start,
        end,
        mode,
      },
    ),
  generatePublicToken: () => post<string>('/generate-public-token'),
  getBestSongsOfHour: (start: Date, end: Date) =>
    get<
      {
        _id: number;
        total: number;
        tracks: { count: number; track: Track; artist: Artist }[];
      }[]
    >('/spotify/top/hour-repartition/songs', { start, end }),
  getBestAlbumsOfHour: (start: Date, end: Date) =>
    get<
      {
        _id: number;
        total: number;
        albums: { count: number; album: Album; artist: Artist }[];
      }[]
    >('/spotify/top/hour-repartition/albums', { start, end }),
  getBestArtistsOfHour: (start: Date, end: Date) =>
    get<
      {
        _id: number;
        total: number;
        artists: { count: number; artist: Artist }[];
      }[]
    >('/spotify/top/hour-repartition/artists', { start, end }),
};
