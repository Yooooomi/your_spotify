const db = require('../database');
const Axios = require('axios');
const logger = require('../tools/logger');

// const saveArtist = async artist => {
//   let dbartist = db.Artist.findOne({ id: artist.id }).catch(console.log);
//   dbartist = await dbartist;

//   if (!dbartist) {
//     await db.Artist.create(artist);
//     console.log('Created artist ', artist.name);
//   }
// }

// const saveMusic = async (track) => {
//   const { artists } = track;
//   const { album } = track;

//   album.artists = album.artists.map(e => e.id);
//   track.artists = track.artists.map(e => e.id);
//   track.album = track.album.id;

//   let dbalbum = db.Album.findOne({ id: album.id }).catch(console.log);
//   let dbtrack = db.Track.findOne({ id: track.id }).catch(console.log);

//   dbalbum = await dbalbum;
//   dbtrack = await dbtrack;

//   // for (let i = 0; i < artists.length; i++) {
//   //   await saveArtist(artists[i]);
//   // }
//   await Promise.all(artists.map(saveArtist));

//   if (!dbalbum) {
//     await db.Album.create(album).catch(console.log);
//     console.log('Created album ', album.name);
//   }
//   if (!dbtrack) {
//     await db.Track.create(track).catch(console.log);
//     console.log('Created track ', track.name);
//   }
// };


// const saveMusics = async (musics, access) => {
//   if (musics.length > 50) {
//     throw new Error('Too many songs at once');
//   }

//   const ids = musics.map(e => e.id);
//   const finalUrl = url + '?ids=' + ids.join(',');

//   const { data } = await axios.get(finalUrl, {
//     headers: {
//       Authorization: `Bearer ${access}`,
//     },
//   });
//   // for (let i = 0; i < data.tracks.length; i++) {
//   //   await saveMusic(data.tracks[i]);
//   // }
//   await Promise.all(data.tracks.map(e => saveMusic(e)));
// }

const url = 'https://api.spotify.com/v1/tracks';

const storeTracksAndReturnAlbumsArtists = async (ids, client) => {
  const query = `?ids=${ids.join(',')}`;
  const finalUrl = `${url}${query}`;

  const { data } = await client.get(finalUrl);
  const { tracks } = data;

  const artistIds = [];
  const albumIds = [];

  tracks.forEach(track => {
    logger.info(`Storing non existing track ${track.name} by ${track.artists[0].name}`);

    track.artists.forEach(art => {
      if (!artistIds.includes(art.id)) {
        artistIds.push(art.id);
      }
    });

    if (!albumIds.includes(track.album.id)) {
      albumIds.push(track.album.id);
    }

    track.album = track.album.id;
    track.artists = track.artists.map(art => art.id);
  });

  await db.Track.create(tracks).catch(() => { });

  return {
    artists: artistIds,
    albums: albumIds,
  };
}

const albumUrl = 'https://api.spotify.com/v1/albums';

const storeAlbums = async (ids, client) => {
  const query = `?ids=${ids.join(',')}`;
  const finalUrl = `${albumUrl}${query}`;

  const { data } = await client.get(finalUrl);
  const { albums } = data;

  albums.forEach(alb => {
    logger.info(`Storing non existing album ${alb.name} by ${alb.artists[0].name}`)

    alb.artists = alb.artists.map(art => art.id);
    delete alb.tracks;
  });

  await db.Album.create(albums).catch(() => { });
}

const artistUrl = 'https://api.spotify.com/v1/artists';

const storeArtists = async (ids, client) => {
  const query = `?ids=${ids.join(',')}`;
  const finalUrl = `${artistUrl}${query}`;

  const { data } = await client.get(finalUrl);
  const { artists } = data;

  artists.forEach(artist => logger.info(`Storing non existing artist ${artist.name}`));

  await db.Artist.create(artists).catch(() => { });
}

const saveMusics = async (tracks, access) => {
  const client = Axios.create({
    headers: {
      Authorization: `Bearer ${access}`,
    },
  });

  const artistIds = [];
  tracks.forEach(track => artistIds.push(...track.artists.map(art => art.id)));

  tracks.forEach(track => track.artists = track.artists.map(art => art.id));

  const ids = tracks.map(track => track.id);
  const storedTracks = await db.Track.find({ id: { $in: ids } });
  const missingTrackIds = ids.filter(id => !storedTracks.find(stored => stored.id.toString() === id.toString()));

  if (missingTrackIds.length === 0) {
    logger.info('No missing tracks, passing...');
    return;
  }

  const { artists, albums } = await storeTracksAndReturnAlbumsArtists(missingTrackIds, client);

  const storedAlbums = await db.Album.find({ id: { $in: albums } });
  const missingAlbumIds = albums.filter(alb => !storedAlbums.find(salb => salb.id.toString() === alb.toString()));

  const storedArtists = await db.Artist.find({ id: { $in: artists } });
  const missingArtistIds = artists.filter(alb => !storedArtists.find(salb => salb.id.toString() === alb.toString()));

  if (missingAlbumIds.length > 0) {
    await storeAlbums(missingAlbumIds, client);
  }
  if (missingArtistIds.length > 0) {
    await storeArtists(missingArtistIds, client);
  }
};

module.exports = {
  saveMusics,
};
