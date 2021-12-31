const mongoose = require('mongoose');
const { UserSchema, InfosSchema, ArtistSchema, AlbumSchema, TrackSchema, GlobalPreferencesSchema, MigrationSchema } = require("./Schemas");

const User = mongoose.model('User', UserSchema);
const Infos = mongoose.model('Infos', InfosSchema);
const Artist = mongoose.model('Artist', ArtistSchema);
const Album = mongoose.model('Album', AlbumSchema);
const Track = mongoose.model('Track', TrackSchema);
const Migration = mongoose.model('Migration', MigrationSchema);
const GlobalPreferences = mongoose.model('GlobalPreference', GlobalPreferencesSchema);

module.exports = {
  User,
  Infos,
  Artist,
  Album,
  Track,
  GlobalPreferences,
  Migration,
};
