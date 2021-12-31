const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: String,
  password: String,
  spotifyId: String,
  expiresIn: Number,
  accessToken: String,
  refreshToken: String,
  activated: Boolean,
  lastTimestamp: Number,
  tracks: { type: [mongoose.Schema.Types.ObjectId], ref: 'Infos', select: false },
  settings: {
    historyLine: Boolean,
    preferredStatsPeriod: String,
    nbElements: Number,
    metricUsed: {
      type: String,
      enum: ['number', 'duration'],
    },
  },
}, { toJSON: { virtuals: true }, toObject: { virtuals: true } });

const InfosSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  id: String,
  played_at: Date,
}, { toJSON: { virtuals: true }, toObject: { virtuals: true } });

const ArtistSchema = new mongoose.Schema({
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
}, { toJSON: { virtuals: true }, toObject: { virtuals: true } });

const AlbumSchema = new mongoose.Schema({
  album_type: String,
  artists: [String],
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
}, { toJSON: { virtuals: true }, toObject: { virtuals: true } });

const TrackSchema = new mongoose.Schema({
  album: String, // Id of the album
  artists: [String], // Ids of artists
  available_markets: [String],
  disc_number: Number,
  duration_ms: Number,
  explicit: Boolean,
  external_ids: Object,
  external_urls: Object,
  href: String,
  id: { type: String, unique: true },
  is_local: Boolean,
  name: String,
  popularity: Number,
  preview_url: String,
  track_number: Number,
  type: String,
  uri: String,
}, { toJSON: { virtuals: true }, toObject: { virtuals: true } })

const GlobalPreferencesSchema = new mongoose.Schema({
  allowRegistrations: { type: Boolean, default: true },
});

const MigrationSchema = new mongoose.Schema({
  lastRun: String, // Name of the last file ran
  migrations: Array,
});

InfosSchema.virtual('track', {
  ref: 'Track',
  localField: 'id',
  foreignField: 'id',
  justOne: true,
});
AlbumSchema.virtual('artist', {
  ref: 'Artist',
  localField: 'artists',
  foreignField: 'id',
  justOne: false,
});
TrackSchema.virtual('full_album', {
  ref: 'Album',
  localField: 'album',
  foreignField: 'id',
  justOne: true,
});
TrackSchema.virtual('full_artist', {
  ref: 'Artist',
  localField: 'artists',
  foreignField: 'id',
  justOne: false,
});

module.exports = {
  UserSchema,
  InfosSchema,
  ArtistSchema,
  AlbumSchema,
  TrackSchema,
  GlobalPreferencesSchema,
  MigrationSchema,
};
