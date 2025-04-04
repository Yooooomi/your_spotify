import { CollaborativeMode, SpotifyImage, Track } from "../../../types";

export interface Playlist {
  id: string;
  name: string;
  owner: {
    id: string;
  };
  images: SpotifyImage[];
  tracks: {
    total: number;
    items: Track[];
  };
}

export interface PlaylistTopSongsContext {
  type: "top";
  nb: number;
  interval: { start: number; end: number };
}

export interface PlaylistAffinityContext {
  type: "affinity";
  userIds: string[];
  nb: number;
  interval: { start: number; end: number };
  mode: CollaborativeMode;
}

export interface PlaylistSingleSongContext {
  type: "single";
  songId: string;
}

export type PlaylistContext =
  | PlaylistTopSongsContext
  | PlaylistSingleSongContext
  | PlaylistAffinityContext;

export type PlaylistContextFromType<T extends PlaylistContext["type"]> =
  Extract<PlaylistContext, { type: T }>;
