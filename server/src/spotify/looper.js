const { Spotify } = require('../tools/oauth/Provider');
const db = require('../database');
const Axios = require('axios');
const dbTools = require('./dbTools');
const occasionnal = require('./Occasionnal');
const logger = require('../tools/logger');

const refresh = async user => {
  const infos = await Spotify.refresh(user.refreshToken);

  return db.storeInUser('_id', user._id, infos);
}

const createHttpClient = access => {
  const axios = Axios.create({
    headers: {
      Authorization: `Bearer ${access}`,
    },
  });

  return axios;
}

const loop = async user => {
  logger.info(`Refreshing songs for ${user.username}`)

  if (Date.now() > user.expiresIn) {
    user = await refresh(user);
    logger.info(`Refreshed token for ${user.username}`);
  }

  const client = createHttpClient(user.accessToken);

  const url = `https://api.spotify.com/v1/me/player/recently-played?after=${user.lastTimestamp}`;

  let lastDiscovery = user.lastDiscovery;
  const now = new Date();

  if (!lastDiscovery || lastDiscovery.getDate() !== now.getDate()) {
    occasionnal.handleOccasionnal(user);
  }

  try {
    const items = [];
    let data = null;
    let nextUrl = url;

    do {
      const response = await client.get(nextUrl);
      data = response.data;
      items.push(...data.items);
      nextUrl = data.next;
    } while (nextUrl);

    await db.storeInUser('_id', user._id, {
      lastTimestamp: Date.now(),
    });

    if (items.length > 0) {
      const tracks = items.map(e => e.track);
      await dbTools.saveMusics(tracks, user.accessToken);
      const infos = items.map(e => ({ played_at: e.played_at, id: e.track.id }));
      await db.addTrackIdsToUser(user._id, infos);
    } else {
      logger.info('User has no new music');
    }
  } catch (e) {
    console.error(e);
  }
};

const reflect = p => p.then(v => ({ failed: false }), e => ({ failed: true, error: e }));
const wait = ms => new Promise((s, f) => setTimeout(s, ms));

const dbLoop = async () => {
  while (true) {
    let nbUsers = await db.getUsersNb();
    const batchSize = 1;
    logger.info(`Starting loop for ${nbUsers} users`);

    for (let i = 0; i < nbUsers; i += batchSize) {
      const users = await db.getUsers(
        batchSize,
        i * batchSize,
        {
          activated: true,
        },
      );

      const promises = users.map(us => reflect(loop(us)));
      const results = await Promise.all(promises);

      results.filter(e => e.failed).forEach(e => logger.error(e.error));

      await wait(120 * 1000);
    }
  }
}

module.exports = {
  dbLoop,
};
