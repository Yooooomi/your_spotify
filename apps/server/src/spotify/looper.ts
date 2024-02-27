/* eslint-disable no-await-in-loop */
import { MongoServerSelectionError } from "mongodb";
import { AxiosError } from "axios";
import { getCloseTrackId, getUser, getUserCount } from "../database";
import { RecentlyPlayedTrack } from "../database/schemas/track";
import { User } from "../database/schemas/user";
import { logger } from "../tools/logger";
import { retryPromise, wait } from "../tools/misc";
import { SpotifyAPI } from "../tools/apis/spotifyApi";
import { Infos } from "../database/schemas/info";
import { getTracksAlbumsArtists, storeIterationOfLoop } from "./dbTools";

const RETRY = 10;

const loop = async (user: User) => {
  logger.info(`[${user.username}]: refreshing...`);

  if (!user.accessToken) {
    logger.error(
      `User ${user.username} has not access token, please relog to Spotify`,
    );
    return;
  }

  const url = `/me/player/recently-played?after=${
    user.lastTimestamp - 1000 * 60 * 60 * 2
  }`;
  const spotifyApi = new SpotifyAPI(user._id.toString());

  const items: RecentlyPlayedTrack[] = [];
  let nextUrl = url;

  do {
    const response = await retryPromise(
      // eslint-disable-next-line @typescript-eslint/no-loop-func
      () => spotifyApi.raw(nextUrl),
      RETRY,
      30,
    );
    const { data } = response;
    items.push(...data.items);
    nextUrl = data.next;
  } while (nextUrl);

  const lastTimestamp = Date.now();

  if (items.length === 0) {
    logger.info(`[${user.username}]: no new music`);
    return;
  }

  const spotifyTracks = items.map(e => e.track);
  const { tracks, albums, artists } = await getTracksAlbumsArtists(
    user._id.toString(),
    spotifyTracks,
  );
  const infos: Omit<Infos, "owner">[] = [];
  for (let i = 0; i < items.length; i += 1) {
    const item = items[i]!;
    const date = new Date(item.played_at);
    const duplicate = await getCloseTrackId(
      user._id.toString(),
      item.track.id,
      date,
      30,
    );
    if (duplicate.length === 0) {
      const isBlacklisted = user.settings.blacklistedArtists.find(
        a => a === item.track.artists[0]?.id,
      );
      const [primaryArtist] = item.track.artists;
      if (!primaryArtist) {
        continue;
      }
      infos.push({
        played_at: new Date(item.played_at),
        durationMs: item.track.duration_ms,
        albumId: item.track.album.id,
        primaryArtistId: primaryArtist.id,
        artistIds: item.track.artists.map(e => e.id),
        id: item.track.id,
        ...(isBlacklisted ? { blacklistedBy: "artist" } : {}),
      });
    }
  }
  await storeIterationOfLoop(
    user._id.toString(),
    lastTimestamp,
    tracks,
    albums,
    artists,
    infos,
  );
  logger.info(
    `[${user.username}]: ${tracks.length} tracks, ${albums.length} albums, ${artists.length} artists`,
  );
};

const WAIT_MS = 120 * 1000;

export const dbLoop = async () => {
  // return;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      const nbUsers = await getUserCount();
      logger.info(`[DbLoop] starting for ${nbUsers} users`);

      for (let i = 0; i < nbUsers; i += 1) {
        const users = await getUser(i);

        for (const us of users) {
          await loop(us);
        }
      }
    } catch (error) {
      logger.error(error);
      if (error instanceof MongoServerSelectionError) {
        logger.error("Exiting because mongo is unreachable");
        process.exit(1);
      }
      if (error instanceof AxiosError) {
        if (error.response?.data) {
          logger.info("Response of failed request", error.response.data);
        }
        logger.info(
          "There appears to be issues with either your internet connection or Spotify",
        );
      }
    }
    await wait(WAIT_MS);
  }
};
