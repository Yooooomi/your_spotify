import { TrackModel, AlbumModel, ArtistModel } from '../database/Models';
import { SpotifyAlbum, Album } from '../database/schemas/album';
import { SpotifyArtist, Artist } from '../database/schemas/artist';
import { SpotifyTrack, Track } from '../database/schemas/track';
import { logger } from '../tools/logger';
import { retryPromise } from '../tools/misc';
import { SpotifyAPI } from '../tools/spotifyApi';

const getIdsHandlingMax = async <
  T extends SpotifyTrack | SpotifyAlbum | SpotifyArtist,
>(
  userId: string,
  url: string,
  ids: string[],
  max: number,
  arrayPath: string,
) => {
  const idsArray = [];
  const chunkNb = Math.ceil(ids.length / max);

  for (let i = 0; i < chunkNb; i += 1) {
    idsArray.push(ids.slice(i * max, Math.min(ids.length, (i + 1) * max)));
  }
  const datas = [];

  const spotifyApi = new SpotifyAPI(userId);

  // Voluntarily waiting in loop to prevent requests limit
  for (let i = 0; i < idsArray.length; i += 1) {
    const builtUrl = `${url}?ids=${idsArray[i].join(',')}`;
    // eslint-disable-next-line no-await-in-loop
    const { data } = await retryPromise(() => spotifyApi.raw(builtUrl), 10, 30);
    datas.push(...data[arrayPath]);
  }
  return datas as T[];
};

const url = 'https://api.spotify.com/v1/tracks';

const storeTracksAndReturnAlbumsArtists = async (
  userId: string,
  ids: string[],
) => {
  const spotifyTracks = await getIdsHandlingMax<SpotifyTrack>(
    userId,
    url,
    ids,
    50,
    'tracks',
  );

  const artistIds: string[] = [];
  const albumIds: string[] = [];

  const tracks: Track[] = spotifyTracks.map<Track>(track => {
    logger.info(
      `Storing non existing track ${track.name} by ${track.artists[0].name}`,
    );

    track.artists.forEach(art => {
      if (!artistIds.includes(art.id)) {
        artistIds.push(art.id);
      }
    });

    if (!albumIds.includes(track.album.id)) {
      albumIds.push(track.album.id);
    }

    return {
      ...track,
      album: track.album.id,
      artists: track.artists.map(art => art.id),
    };
  });

  await TrackModel.create(tracks).catch(() => {});

  return {
    artists: artistIds,
    albums: albumIds,
  };
};

const albumUrl = 'https://api.spotify.com/v1/albums';

export const storeAlbums = async (userId: string, ids: string[]) => {
  const spotifyAlbums = await getIdsHandlingMax<SpotifyAlbum>(
    userId,
    albumUrl,
    ids,
    20,
    'albums',
  );

  const albums: Album[] = spotifyAlbums.map(alb => {
    logger.info(
      `Storing non existing album ${alb.name} by ${alb.artists[0].name}`,
    );

    return {
      ...alb,
      artists: alb.artists.map(art => art.id),
    };
  });

  await AlbumModel.create(albums).catch(() => {});
};

const artistUrl = 'https://api.spotify.com/v1/artists';

export const storeArtists = async (userId: string, ids: string[]) => {
  const artists = await getIdsHandlingMax<SpotifyTrack>(
    userId,
    artistUrl,
    ids,
    50,
    'artists',
  );

  artists.forEach(artist =>
    logger.info(`Storing non existing artist ${artist.name}`),
  );

  await ArtistModel.create(artists).catch(() => {});
};

export const saveMusics = async (userId: string, tracks: SpotifyTrack[]) => {
  const ids = tracks.map(track => track.id);
  const storedTracks: Track[] = await TrackModel.find({ id: { $in: ids } });
  const missingTrackIds = ids.filter(
    id => !storedTracks.find(stored => stored.id.toString() === id.toString()),
  );

  if (missingTrackIds.length === 0) {
    logger.info('No missing tracks, passing...');
    return;
  }

  const { artists, albums } = await storeTracksAndReturnAlbumsArtists(
    userId,
    missingTrackIds,
  );

  const storedAlbums: Album[] = await AlbumModel.find({ id: { $in: albums } });
  const missingAlbumIds = albums.filter(
    alb => !storedAlbums.find(salb => salb.id.toString() === alb.toString()),
  );

  const storedArtists: Artist[] = await ArtistModel.find({
    id: { $in: artists },
  });
  const missingArtistIds = artists.filter(
    alb => !storedArtists.find(salb => salb.id.toString() === alb.toString()),
  );

  if (missingAlbumIds.length > 0) {
    await storeAlbums(userId, missingAlbumIds);
  }
  if (missingArtistIds.length > 0) {
    await storeArtists(userId, missingArtistIds);
  }
};
