import mongoose from "mongoose";
import { TrackModel, AlbumModel, ArtistModel } from "../database/Models";
import { SpotifyAlbum, Album } from "../database/schemas/album";
import { SpotifyArtist, Artist } from "../database/schemas/artist";
import { SpotifyTrack, Track } from "../database/schemas/track";
import { logger } from "../tools/logger";
import { minOfArray, retryPromise, uniqBy } from "../tools/misc";
import { SpotifyAPI } from "../tools/apis/spotifyApi";
import {
  addTrackIdsToUser,
  storeInUser,
  storeFirstListenedAtIfLess,
} from "../database";
import { Infos } from "../database/schemas/info";
import { longWriteDbLock } from "../tools/lock";
import { Metrics } from "../tools/metrics";

const getIdsIndividually = async <
  T extends SpotifyTrack | SpotifyAlbum | SpotifyArtist,
>(
  userId: string,
  baseUrl: string,
  ids: string[],
) => {
  const results: T[] = [];
  const spotifyApi = new SpotifyAPI(userId);

  for (const id of ids) {
    try {
      const { data } = await retryPromise(
        () => spotifyApi.raw(`${baseUrl}/${id}`),
        10,
        30,
      );
      results.push(data as T);
    } catch {
      logger.warn(`Failed to fetch ${baseUrl}/${id}, skipping`);
    }
  }
  return results;
};

const trackUrl = "https://api.spotify.com/v1/tracks";

export const getTracks = async (userId: string, ids: string[]) => {
  const spotifyTracks = await getIdsIndividually<SpotifyTrack>(
    userId,
    trackUrl,
    ids,
  );

  const tracks = spotifyTracks.map<Track>(track => {
    logger.info(
      `Storing non existing track ${track.name} by ${track.artists[0]?.name}`,
    );
    return {
      ...track,
      album: track.album.id,
      artists: track.artists.map(e => e.id),
    };
  });
  Metrics.ingestedTracksTotal.inc({ user: userId }, tracks.length);

  return tracks;
};

const albumUrl = "https://api.spotify.com/v1/albums";

export const getAlbums = async (userId: string, ids: string[]) => {
  const spotifyAlbums = await getIdsIndividually<SpotifyAlbum>(
    userId,
    albumUrl,
    ids,
  );

  const albums: Album[] = spotifyAlbums.map(alb => {
    logger.info(
      `Storing non existing album ${alb.name} by ${alb.artists[0]?.name}`,
    );

    return {
      ...alb,
      artists: alb.artists.map(art => art.id),
    };
  });
  Metrics.ingestedAlbumsTotal.inc({ user: userId }, albums.length);

  return albums;
};

const artistUrl = "https://api.spotify.com/v1/artists";

export const getArtists = async (userId: string, ids: string[]) => {
  const artists = await getIdsIndividually<Artist>(
    userId,
    artistUrl,
    ids,
  );

  artists.forEach(artist =>
    logger.info(`Storing non existing artist ${artist.name}`),
  );
  Metrics.ingestedArtistsTotal.inc({ user: userId }, artists.length);

  return artists;
};

const getTracksAndRelatedAlbumArtists = async (
  userId: string,
  ids: string[],
) => {
  const tracks = await getTracks(userId, ids);

  return {
    tracks,
    artists: [...new Set(tracks.flatMap(e => e.artists)).values()],
    albums: [...new Set(tracks.map(e => e.album)).values()],
  };
};

export const getTracksAlbumsArtists = async (
  userId: string,
  spotifyTracks: SpotifyTrack[],
) => {
  const ids = spotifyTracks.map(track => track.id);
  const storedTracks: Track[] = await TrackModel.find({ id: { $in: ids } });
  const missingTrackIds = ids.filter(
    id => !storedTracks.find(stored => stored.id.toString() === id.toString()),
  );

  if (missingTrackIds.length === 0) {
    logger.info("No missing tracks, passing...");
    return {
      tracks: [],
      albums: [],
      artists: [],
    };
  }

  const {
    tracks,
    artists: relatedArtists,
    albums: relatedAlbums,
  } = await getTracksAndRelatedAlbumArtists(userId, missingTrackIds);

  const storedAlbums: Album[] = await AlbumModel.find({
    id: { $in: relatedAlbums },
  });
  const missingAlbumIds = relatedAlbums.filter(
    alb => !storedAlbums.find(salb => salb.id.toString() === alb.toString()),
  );

  const storedArtists: Artist[] = await ArtistModel.find({
    id: { $in: relatedArtists },
  });
  const missingArtistIds = relatedArtists.filter(
    alb => !storedArtists.find(salb => salb.id.toString() === alb.toString()),
  );

  const albums =
    missingAlbumIds.length > 0 ? await getAlbums(userId, missingAlbumIds) : [];
  const artists =
    missingArtistIds.length > 0
      ? await getArtists(userId, missingArtistIds)
      : [];

  return {
    tracks,
    albums,
    artists,
  };
};

export async function storeTrackAlbumArtist({
  tracks,
  albums,
  artists,
}: {
  tracks?: Track[];
  albums?: Album[];
  artists?: Artist[];
}) {
  if (tracks) {
    await TrackModel.create(uniqBy(tracks, item => item.id));
  }
  if (albums) {
    await AlbumModel.create(uniqBy(albums, item => item.id));
  }
  if (artists) {
    await ArtistModel.create(uniqBy(artists, item => item.id));
  }
}

export async function storeIterationOfLoop(
  userId: string,
  iterationTimestamp: number,
  tracks: Track[],
  albums: Album[],
  artists: Artist[],
  infos: Omit<Infos, "owner">[],
) {
  await longWriteDbLock.lock();

  await storeTrackAlbumArtist({
    tracks,
    albums,
    artists,
  });

  await addTrackIdsToUser(userId, infos);

  await storeInUser("_id", new mongoose.Types.ObjectId(userId), {
    lastTimestamp: iterationTimestamp,
  });

  const min = minOfArray(infos, item => item.played_at.getTime());

  if (min) {
    const minInfo = infos[min.minIndex]?.played_at;
    if (minInfo) {
      await storeFirstListenedAtIfLess(userId, minInfo);
    }
  }

  longWriteDbLock.unlock();
}
