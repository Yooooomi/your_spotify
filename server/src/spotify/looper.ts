/* eslint-disable no-await-in-loop */
import { storeInUser, addTrackIdsToUser, getUsersNb, getUsers } from '../database';
import { RecentlyPlayedTrack } from '../database/schemas/track';
import { User } from '../database/schemas/user';
import { logger } from '../tools/logger';
import { wait } from '../tools/misc';
import { Spotify } from '../tools/oauth/Provider';
import { refreshIfNeeded, saveMusics } from './dbTools';

const loop = async (user: User) => {
  logger.info(`Refreshing songs for ${user.username}`);

  const newUser = await refreshIfNeeded(user);
  if (!newUser) {
    logger.error(`${user.username} has no refresh token`);
    return;
  }
  user = newUser;

  if (!user.accessToken) {
    logger.error(`User ${user.username} has not access token, please relog to Spotify`);
    return;
  }

  const client = Spotify.getHttpClient(user.accessToken);
  const url = `/me/player/recently-played?after=${user.lastTimestamp}`;

  try {
    const items: RecentlyPlayedTrack[] = [];
    let nextUrl = url;

    do {
      const response = await client.get(nextUrl);
      const { data } = response;
      items.push(...data.items);
      nextUrl = data.next;
    } while (nextUrl);

    await storeInUser('_id', user._id, {
      lastTimestamp: Date.now(),
    });

    if (items.length > 0) {
      const tracks = items.map((e) => e.track);
      try {
        await saveMusics(tracks, client);
        const infos = items.map((e) => ({
          played_at: new Date(e.played_at),
          id: e.track.id,
        }));
        await addTrackIdsToUser(user._id.toString(), infos);
      } catch (e) {
        logger.info(e.response.data);
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

export const dbLoop = async () => {
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const nbUsers = await getUsersNb();
    const batchSize = 1;
    logger.info(`Starting loop for ${nbUsers} users`);

    if (nbUsers === 0) {
      // To prevent loop going crazy if there are no registered users
      await wait(120 * 1000);
      continue;
    }

    for (let i = 0; i < nbUsers; i += batchSize) {
      const users = await getUsers(batchSize, i * batchSize, {
        activated: true,
      });

      const promises = users.map((us) => reflect(loop(us)));
      const results = await Promise.all(promises);

      results.filter((e) => e.failed).forEach((e) => logger.error(e.error));

      await wait(120 * 1000);
    }
  }
};
