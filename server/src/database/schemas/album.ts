import { Schema } from 'mongoose';
import { Artist } from './artist';
import { Track } from './track';
import { SpotifyImage } from './types';

export interface Album {
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
  type: string;
  uri: string;
}

export type SpotifyAlbum = Omit<Album, 'artists'> & {
  artists: Artist[];
  tracks: Track[];
};

export const AlbumSchema = new Schema<Album>(
  {
    album_type: String,
    artists: { type: [String], index: true },
    available_markets: [String],
    copyrights: [Object],
    external_ids: Object,
    external_urls: Object,
    genres: [String],
    href: String,
    id: { type: String, unique: true },
    images: [Object],
    name: String,
    popularity: Number,
    release_date: String,
    release_date_precision: String,
    //  "tracks": ,
    type: String,
    uri: String,
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

AlbumSchema.virtual('artist', {
  ref: 'Artist',
  localField: 'artists',
  foreignField: 'id',
  justOne: false,
});
