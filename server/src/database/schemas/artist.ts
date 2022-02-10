import { Schema } from 'mongoose';
import { SpotifyImage } from './types';

export interface Artist {
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
export type SpotifyArtist = Artist;

export const ArtistSchema = new Schema<Artist>(
  {
    external_urls: Object,
    followers: Object,
    genres: [String],
    href: String,
    id: { type: String, unique: true },
    images: [Object],
    name: String,
    popularity: Number,
    type: String,
    uri: String,
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } },
);
