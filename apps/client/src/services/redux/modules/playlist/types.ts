import { CollaborativeMode, SpotifyImage } from "../../../types";

export interface Playlist {
  id: string;
  name: string;
  images: SpotifyImage[] | null;
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
  type: "specific";
  songIds: Array<string>;
}

export type PlaylistContext =
  | PlaylistTopSongsContext
  | PlaylistSingleSongContext
  | PlaylistAffinityContext;

export type PlaylistContextFromType<T extends PlaylistContext["type"]> =
  Extract<PlaylistContext, { type: T }>;
