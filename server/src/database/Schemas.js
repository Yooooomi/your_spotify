const mongoose = require('mongoose');

const User = mongoose.model('User',
  new mongoose.Schema({
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
    },
  }, { toJSON: { virtuals: true }, toObject: { virtuals: true } }),
);

const Infos = mongoose.model('Infos',
  new mongoose.Schema({
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    id: String,
    played_at: Date,
  }, { toJSON: { virtuals: true }, toObject: { virtuals: true } }),
);

Infos.schema.virtual('track', {
  ref: 'Track',
  localField: 'id',
  foreignField: 'id',
  justOne: true,
})

const Artist = mongoose.model('Artist', {
  "external_urls": Object,
  "followers": Object,
  "genres": [String],
  "href": String,
  "id": { type: String, unique: true },
  "images": [Object],
  "name": String,
  "popularity": Number,
  "type": String,
  "uri": String,
});

const Album = mongoose.model('Album', {
  "album_type": String,
  "artists": [String],
  "available_markets": [String],
  "copyrights": [Object],
  "external_ids": Object,
  "external_urls": Object,
  "genres": [String],
  "href": String,
  "id": { type: String, unique: true },
  "images": [Object],
  "name": String,
  "popularity": Number,
  "release_date": String,
  "release_date_precision": String,
  //  "tracks": ,
  "type": String,
  "uri": String,
});

Album.schema.virtual('artist', {
  ref: 'Artist',
  localField: 'artists',
  foreignField: 'id',
  justOne: false,
})

const Track = mongoose.model('Track', {
  "album": String, // Id of the album
  "artists": [String], // Ids of artists
  "available_markets": [String],
  "disc_number": Number,
  "duration_ms": Number,
  "explicit": Boolean,
  "external_ids": Object,
  "external_urls": Object,
  "href": String,
  "id": { type: String, unique: true },
  "is_local": Boolean,
  "name": String,
  "popularity": Number,
  "preview_url": String,
  "track_number": Number,
  "type": String,
  "uri": String,
});

Track.schema.virtual('full_album', {
  ref: 'Album',
  localField: 'album',
  foreignField: 'id',
  justOne: true,
});

Track.schema.virtual('full_artist', {
  ref: 'Artist',
  localField: 'artists',
  foreignField: 'id',
  justOne: false,
});

/*"played_at": "2016-12-13T20:44:04.589Z",
  "context": {
  "uri": "spotify:artist:5INjqkS1o8h1imAzPqGZBb",
    "external_urls": {
    "spotify": "https://open.spotify.com/artist/5INjqkS1o8h1imAzPqGZBb"
  },
  "href": "https://api.spotify.com/v1/artists/5INjqkS1o8h1imAzPqGZBb",
    "type": "artist"
*/

module.exports = {
  User,
  Infos,
  Artist,
  Album,
  Track,
};
