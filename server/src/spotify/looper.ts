import Axios from "axios";
import {
  storeInUser,
  addTrackIdsToUser,
  getUsersNb,
  getUsers,
} from "../database";
import { RecentlyPlayedTrack, SpotifyTrack } from "../database/schemas/track";
import { User } from "../database/schemas/user";
import { logger } from "../tools/logger";
import { Spotify } from "../tools/oauth/Provider";
import { saveMusics } from "./dbTools";

const refresh = async (user: User) => {
  if (!user.refreshToken) {
    return null;
  }
  const infos = await Spotify.refresh(user.refreshToken);

  return storeInUser("_id", user._id, infos);
};

const createHttpClient = (access: string) => {
  const axios = Axios.create({
    headers: {
      Authorization: `Bearer ${access}`,
    },
  });

  return axios;
};

const loop = async (user: User) => {
  logger.info(`Refreshing songs for ${user.username}`);

  // Refresh the token it it expires in less than a minute (1000ms * 60)
  if (Date.now() > user.expiresIn - 1000 * 60) {
    const newUser = await refresh(user);
    if (!newUser) {
      logger.error("No refresh token on user");
      return;
    }
    user = newUser;
    logger.info(`Refreshed token for ${user.username}`);
  }

  if (!user.accessToken) {
    logger.error(
      `User ${user.username} has not access token, please relog to Spotify`
    );
    return;
  }

  const client = createHttpClient(user.accessToken);
  const url = `https://api.spotify.com/v1/me/player/recently-played?after=${user.lastTimestamp}`;

  try {
    const items: RecentlyPlayedTrack[] = [];
    let nextUrl = url;

    do {
      // Waiting to prevent request limit
      const response = await client.get(nextUrl);
      const { data } = response;
      items.push(...data.items);
      nextUrl = data.next;
    } while (nextUrl);

    await storeInUser("_id", user._id, {
      lastTimestamp: Date.now(),
    });

    if (items.length > 0) {
      const tracks = items.map((e) => e.track);
      try {
        await saveMusics(tracks, user.accessToken);
        const infos = items.map((e) => ({
          played_at: new Date(e.played_at),
          id: e.track.id,
        }));
        await addTrackIdsToUser(user._id.toString(), infos);
      } catch (e) {
        logger.info(e.response.data);
      }
    } else {
      logger.info("User has no new music");
    }
  } catch (e) {
    logger.error(e);
  }
};

const reflect = (p: Promise<any>) =>
  p.then(
    () => ({ failed: false, error: null }),
    (e: any) => ({ failed: true, error: e })
  );
const wait = (ms: number) => new Promise((s) => setTimeout(s, ms));

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
