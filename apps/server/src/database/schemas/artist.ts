import { Schema } from "mongoose";

import { SpotifyImage } from "./types";

export interface Artist {
  external_urls: any;
  genres: string[];
  href: string;
  id: string;
  images: SpotifyImage[];
  name: string;
  type: string;
  uri: string;
}
export type SpotifyArtist = Artist;

export const ArtistSchema = new Schema<Artist>(
  {
    external_urls: Object,
    genres: [String],
    href: String,
    id: { type: String, unique: true },
    images: [Object],
    name: String,
    type: String,
    uri: String,
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } },
);
