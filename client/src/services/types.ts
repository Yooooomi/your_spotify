export type UnboxPromise<T extends Promise<any>> = T extends Promise<infer U>
  ? U
  : never;

export interface GlobalPreferences {
  allowRegistrations: boolean;
}

export enum Timesplit {
  all = 'all',
  hour = 'hour',
  day = 'day',
  week = 'week',
  month = 'month',
  year = 'year',
}
export const isTimesplit = (str: string | null): str is Timesplit => {
  if (!str) {
    return false;
  }
  return Object.values(Timesplit).includes(str as Timesplit);
};

export enum Precision {
  hour = 'hour',
  day = 'day',
  week = 'week',
  month = 'month',
  year = 'year',
}

export interface SpotifyImage {
  url: string;
  height: number;
  width: number;
}

export interface Artist {
  _id: string;
  external_urls: any;
  followers: any;
  genres: string[];
  href: string;
  id: string;
  images: SpotifyImage[];
  name: string;
  popularity: number;
  type: string;
  uri: string;
}

export interface Album {
  _id: string;
  album_type: string;
  artists: string[];
  available_markets: string[];
  copyrights: any[];
  external_ids: any;
  external_urls: any;
  genres: string[];
  href: string;
  id: string;
  images: SpotifyImage[];
  name: string;
  popularity: number;
  release_date: string;
  release_date_precision: string;
  //  "tracks": ,
  type: string;
  uri: string;
}

export interface Track {
  _id: string;
  album: string; // Id of the album
  artists: string[]; // Ids of artists
  available_markets: string[];
  disc_number: number;
  duration_ms: number;
  explicit: boolean;
  external_ids: Object;
  external_urls: Object;
  href: string;
  id: string;
  is_local: boolean;
  name: string;
  popularity: number;
  preview_url: string;
  track_number: number;
  type: string;
  uri: string;
}

export type TrackWithAlbum = Omit<Track, 'album'> & {
  album: Album;
};

export interface TrackInfo {
  _id: string;
  owner: string;
  id: string;
  played_at: string;
}

export type TrackInfoWithTrack = TrackInfo & {
  track: Track & {
    full_album: Album;
    full_artist: Artist[];
  };
};

export interface DateId {
  year: number;
  month?: number;
  day?: number;
  hour?: number;
}

export interface SpotifyMe {
  country: string;
  display_name: string;
  email: string;
  href: string;
  id: string;
  images: SpotifyImage[];
  product: string;
  type: string;
  uri: string;
}

export enum CollaborativeMode {
  AVERAGE = 'average',
  MINIMA = 'minima',
}
