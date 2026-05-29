import { Schema } from "mongoose";
import { SpotifyAlbum } from "./album";
import { SpotifyArtist } from "./artist";

export interface Track {
  album: string;
  artists: string[];
  disc_number: number;
  duration_ms: number;
  explicit: boolean;
  external_urls: any;
  href: string;
  id: string;
  isrc?: string;
  is_local: boolean;
  mergedInto?: string;
  name: string;
  preview_url: string;
  track_number: number;
  type: string;
  uri: string;
}

export type SpotifyTrack = Omit<
  Track,
  "artists" | "album" | "isrc" | "mergedInto"
> & {
  artists: SpotifyArtist[];
  album: SpotifyAlbum;
  external_ids?: {
    isrc?: string;
    ean?: string;
    upc?: string;
  };
};

export interface RecentlyPlayedTrack {
  played_at: string;
  track: SpotifyTrack;
}

export const TrackSchema = new Schema<Track>(
  {
    album: { type: String, index: true }, // Id of the album
    artists: { type: [String], index: true }, // Ids of artists
    disc_number: Number,
    duration_ms: Number,
    explicit: Boolean,
    external_urls: Object,
    href: String,
    id: { type: String, unique: true },
    isrc: { type: String, index: true, sparse: true, unique: true },
    is_local: Boolean,
    mergedInto: String,
    name: String,
    preview_url: String,
    track_number: Number,
    type: String,
    uri: String,
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

TrackSchema.virtual("full_album", {
  ref: "Album",
  localField: "album",
  foreignField: "id",
  justOne: true,
});

TrackSchema.virtual("full_artists", {
  ref: "Artist",
  localField: "artists",
  foreignField: "id",
  justOne: false,
});
