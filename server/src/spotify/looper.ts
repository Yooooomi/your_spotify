/* eslint-disable no-await-in-loop */
import {
  storeInUser,
  addTrackIdsToUser,
  getUsersNb,
  getUsers,
  getCloseTrackId,
  storeFirstListenedAtIfLess,
} from '../database';
import { RecentlyPlayedTrack } from '../database/schemas/track';
import { User } from '../database/schemas/user';
import { longWriteDbLock } from '../tools/lock';
import { logger } from '../tools/logger';
import { minOfArray, retryPromise, wait } from '../tools/misc';
import { SpotifyAPI } from '../tools/spotifyApi';
import { saveMusics } from './dbTools';

const loop = async (user: User) => {
  logger.info(`Refreshing songs for ${user.username}`);

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

  try {
    const items: RecentlyPlayedTrack[] = [];
    let nextUrl = url;

    do {
      const response = await retryPromise(
        // eslint-disable-next-line @typescript-eslint/no-loop-func
        () => spotifyApi.raw(nextUrl),
        10,
        30,
      );
      const { data } = response;
      items.push(...data.items);
      nextUrl = data.next;
    } while (nextUrl);

    await storeInUser('_id', user._id, {
      lastTimestamp: Date.now(),
    });

    if (items.length > 0) {
      const tracks = items.map(e => e.track);
      try {
        await saveMusics(user._id.toString(), tracks);
        const infos: { played_at: Date; id: string }[] = [];
        for (let i = 0; i < items.length; i += 1) {
          const item = items[i];
          const date = new Date(item.played_at);
          const duplicate = await getCloseTrackId(
            user._id.toString(),
            item.track.id,
            date,
            30,
          );
          if (duplicate.length === 0) {
            infos.push({
              played_at: new Date(item.played_at),
              id: item.track.id,
            });
          }
        }
        const min = minOfArray(infos, item => item.played_at.getTime());
        await addTrackIdsToUser(user._id.toString(), infos);
        if (min) {
          await storeFirstListenedAtIfLess(
            user._id.toString(),
            infos[min.minIndex].played_at,
          );
        }
      } catch (e) {
        logger.info(e);
        logger.info(e?.response?.data);
      }
    } else {
      logger.info('User has no new music');
    }
  } catch (e) {
    logger.error(e);
  }
};

const reflect = (p: Promise<any>) =>
  p.then(
    () => ({ failed: false, error: null }),
    (e: any) => ({ failed: true, error: e }),
  );

const WAIT_SECONDS = 120;

export const dbLoop = async () => {
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const nbUsers = await getUsersNb();
    const batchSize = 1;
    logger.info(`Starting loop for ${nbUsers} users`);

    if (nbUsers === 0) {
      // To prevent loop going crazy if there are no registered users
      await wait(WAIT_SECONDS * 1000);
      continue;
    }

    for (let i = 0; i < nbUsers; i += batchSize) {
      const users = await getUsers(batchSize, i * batchSize, {});

      await longWriteDbLock.lock();
      const promises = users.map(us => reflect(loop(us)));
      const results = await Promise.all(promises);
      longWriteDbLock.unlock();

      results.filter(e => e.failed).forEach(e => logger.error(e.error));

      await wait(WAIT_SECONDS * 1000);
    }
  }
};
