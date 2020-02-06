const mongoose = require('mongoose');

const User = mongoose.model('User', {
  username: String,
  password: String,
  spotifyId: String,
  expiresIn: Number,
  accessToken: String,
  refreshToken: String,
  activated: Boolean,
  lastTimestamp: Number,
  trackIds: [String],
});

User.schema.virtual('tracks', {
  ref: 'Track',
  localField: 'trackIds',
  foreignField: 'id',
  justOne: false,
});

const Artist = mongoose.model('Artist', {
  "external_urls": Object,
  "href": String,
  "id": String,
  "name": String,
  "type": String,
  "uri": String,
});

const Album = mongoose.model('Album', {
  "album_type": String,
  "artists": [String], // IDs of artists
  "available_markets": [String],
  "external_urls": Object,
  "href": String,
  "id": String,
  "images": [Object],
  "name": String,
  "release_date": String,
  "release_date_precision": String,
  "type": String,
  "uri": String
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
  "id": String,
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
  Artist,
  Album,
  Track,
};
