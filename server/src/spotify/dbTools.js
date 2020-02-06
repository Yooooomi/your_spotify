const db = require('../database');
const credentials = require('../tools/oauth/credentials');
const Axios = require('axios');

const axios = Axios.create();

const saveArtist = async artist => {
  let dbartist = db.Artist.findOne({ id: artist.id }).catch(() => {});
  dbartist = await dbartist;

  if (!dbartist) {
    await db.Artist.create(artist);
    console.log('Created artist ', artist.name);
  }
}

const saveMusic = async (track) => {
  const { artists } = track;
  const { album } = track;

  album.artists = album.artists.map(e => e.id);
  track.artists = track.artists.map(e => e.id);
  track.album = track.album.id;

  let dbalbum = db.Album.findOne({ id: album.id }).catch(() => {});
  let dbtrack = db.Track.findOne({ id: track.id }).catch(() => {});

  dbalbum = await dbalbum;
  dbtrack = await dbtrack;

  // for (let i = 0; i < artists.length; i++) {
  //   await saveArtist(artists[i]);
  // }
  await Promise.all(artists.map(saveArtist));
  
  if (!dbalbum) {
    await db.Album.create(album).catch(() => {});
    console.log('Created album ', album.name);
  }
  if (!dbtrack) {
    await db.Track.create(track).catch(() => {});
    console.log('Created track ', track.name);
  }
};

const url = 'https://api.spotify.com/v1/tracks';

const saveMusics = async (musics, access) => {
  if (musics.length > 50) {
    throw new Error('Too many songs at once');
  }

  const ids = musics.map(e => e.id);
  const finalUrl = url + '?ids=' + ids.join(',');

  const { data } = await axios.get(finalUrl, {
    headers: {
      Authorization: `Bearer ${access}`,
    },
  });
  // for (let i = 0; i < data.tracks.length; i++) {
  //   await saveMusic(data.tracks[i]);
  // }
  await Promise.all(data.tracks.map(e => saveMusic(e)));
}

module.exports = {
  saveMusics,
};
