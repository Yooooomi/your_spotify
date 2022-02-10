import { Router } from 'express';
import Joi from 'joi';
import {
  getTrackBySpotifyId,
  getSongs,
  getSongsPer,
  getMostListenedSongs,
  getMostListenedArtist,
  getTimePer,
  albumDateRatio,
  featRatio,
  popularityPer,
  differentArtistsPer,
  getDayRepartition,
  getBestArtistsPer,
  getBestSongsNbOffseted,
  getBestArtistsNbOffseted,
  getBestAlbumsNbOffseted,
} from '../database';
import { logger } from '../tools/logger';
import { logged, validating, withHttpClient } from '../tools/middleware';
import { SpotifyRequest, LoggedRequest, Timesplit } from '../tools/types';

const router = Router();
export default router;

const playSchema = Joi.object().keys({
  id: Joi.string().required(),
});

router.post('/play', validating(playSchema), logged, withHttpClient, async (req, res) => {
  const { client } = req as SpotifyRequest;
  const { id } = req.body;

  try {
    const track = await getTrackBySpotifyId(id);

    if (!track) return res.status(400).end();
    await client.put('https://api.spotify.com/v1/me/player/play', {
      uris: [track.uri],
    });
    return res.status(200).end();
  } catch (e) {
    if (e.response) {
      logger.error(e.response.data);
      return res.status(400).send(e.response.data.error);
    }
    logger.error(e);
    return res.status(500).end();
  }
});

const gethistorySchema = Joi.object().keys({
  number: Joi.number().max(20).required(),
  offset: Joi.number().required(),
});

router.get('/gethistory', validating(gethistorySchema, 'query'), logged, async (req, res) => {
  const { user } = req as LoggedRequest;
  const { number, offset } = req.query;

  const tracks = await getSongs(
    user._id.toString(),
    offset as unknown as number,
    number as unknown as number,
  );
  return res.status(200).send(tracks);
});

const interval = Joi.object().keys({
  start: Joi.date().required(),
  end: Joi.date().default(() => new Date()),
});

const intervalPerSchema = Joi.object().keys({
  start: Joi.date().required(),
  end: Joi.date().default(() => new Date()),
  timeSplit: Joi.string()
    .allow('all', 'year', 'month', 'week', 'day', 'hour')
    .only()
    .default('day'),
});

router.get('/listened_to', validating(interval, 'query'), logged, async (req, res) => {
  const { user } = req as LoggedRequest;
  const { start, end } = req.query;

  const result = await getSongsPer(user, start as unknown as Date, end as unknown as Date);
  if (result.length > 0) {
    return res.status(200).send({ count: result[0].count });
  }
  return res.status(200).send({ count: 0 });
});

router.get('/most_listened', validating(intervalPerSchema, 'query'), logged, async (req, res) => {
  const { user } = req as LoggedRequest;
  const { start, end, timeSplit } = req.query;

  const result = await getMostListenedSongs(
    user,
    start as unknown as Date,
    end as unknown as Date,
    timeSplit as Timesplit,
  );
  return res.status(200).send(result);
});

router.get(
  '/most_listened_artist',
  validating(intervalPerSchema, 'query'),
  logged,
  async (req, res) => {
    const { user } = req as LoggedRequest;
    const { start, end, timeSplit } = req.query;

    const result = await getMostListenedArtist(
      user,
      start as unknown as Date,
      end as unknown as Date,
      timeSplit as Timesplit,
    );
    return res.status(200).send(result);
  },
);

router.get('/songs_per', validating(intervalPerSchema, 'query'), logged, async (req, res) => {
  const { user } = req as LoggedRequest;
  const { start, end, timeSplit } = req.query;

  const result = await getSongsPer(
    user,
    start as unknown as Date,
    end as unknown as Date,
    timeSplit as Timesplit,
  );
  return res.status(200).send(result);
});

router.get('/time_per', validating(intervalPerSchema, 'query'), logged, async (req, res) => {
  const { user } = req as LoggedRequest;
  const { start, end, timeSplit } = req.query;

  const result = await getTimePer(
    user,
    start as unknown as Date,
    end as unknown as Date,
    timeSplit as Timesplit,
  );
  return res.status(200).send(result);
});

router.get(
  '/album_date_ratio',
  validating(intervalPerSchema, 'query'),
  logged,
  async (req, res) => {
    const { user } = req as LoggedRequest;
    const { start, end, timeSplit } = req.query;

    const result = await albumDateRatio(
      user,
      start as unknown as Date,
      end as unknown as Date,
      timeSplit as Timesplit,
    );
    return res.status(200).send(result);
  },
);

router.get('/feat_ratio', validating(intervalPerSchema, 'query'), logged, async (req, res) => {
  const { user } = req as LoggedRequest;
  const { start, end, timeSplit } = req.query;

  const result = await featRatio(
    user,
    start as unknown as Date,
    end as unknown as Date,
    timeSplit as Timesplit,
  );
  return res.status(200).send(result);
});

router.get('/popularity_per', validating(intervalPerSchema, 'query'), logged, async (req, res) => {
  const { user } = req as LoggedRequest;
  const { start, end, timeSplit } = req.query;

  const result = await popularityPer(
    user,
    start as unknown as Date,
    end as unknown as Date,
    timeSplit as Timesplit,
  );
  return res.status(200).send(result);
});

router.get(
  '/different_artists_per',
  validating(intervalPerSchema, 'query'),
  logged,
  async (req, res) => {
    const { user } = req as LoggedRequest;
    const { start, end, timeSplit } = req.query;

    const result = await differentArtistsPer(
      user,
      start as unknown as Date,
      end as unknown as Date,
      timeSplit as Timesplit,
    );
    return res.status(200).send(result);
  },
);

router.get('/time_per_hour_of_day', validating(interval, 'query'), logged, async (req, res) => {
  const { user } = req as LoggedRequest;
  const { start, end } = req.query;

  const result = await getDayRepartition(user, start as unknown as Date, end as unknown as Date);
  return res.status(200).send(result);
});

router.get(
  '/best_artists_per',
  validating(intervalPerSchema, 'query'),
  logged,
  async (req, res) => {
    const { user } = req as LoggedRequest;
    const { start, end, timeSplit } = req.query;

    const result = await getBestArtistsPer(
      user,
      start as unknown as Date,
      end as unknown as Date,
      timeSplit as Timesplit,
    );
    return res.status(200).send(result);
  },
);

const intervalPerSchemaNbOffset = Joi.object().keys({
  start: Joi.date().required(),
  end: Joi.date().default(() => new Date()),
  nb: Joi.number().min(1).max(30).required(),
  offset: Joi.number().min(0).default(0),
});

router.get(
  '/top/songs',
  validating(intervalPerSchemaNbOffset, 'query'),
  logged,
  async (req, res) => {
    const { user } = req as LoggedRequest;
    const { start, end, nb, offset } = req.query;

    const result = await getBestSongsNbOffseted(
      user,
      start as unknown as Date,
      end as unknown as Date,
      nb as unknown as number,
      offset as unknown as number,
    );
    return res.status(200).send(result);
  },
);

router.get(
  '/top/artists',
  validating(intervalPerSchemaNbOffset, 'query'),
  logged,
  async (req, res) => {
    const { user } = req as LoggedRequest;
    const { start, end, nb, offset } = req.query;

    const result = await getBestArtistsNbOffseted(
      user,
      start as unknown as Date,
      end as unknown as Date,
      nb as unknown as number,
      offset as unknown as number,
    );
    return res.status(200).send(result);
  },
);

router.get(
  '/top/albums',
  validating(intervalPerSchemaNbOffset, 'query'),
  logged,
  async (req, res) => {
    const { user } = req as LoggedRequest;
    const { start, end, nb, offset } = req.query;

    const result = await getBestAlbumsNbOffseted(
      user,
      start as unknown as Date,
      end as unknown as Date,
      nb as unknown as number,
      offset as unknown as number,
    );
    return res.status(200).send(result);
  },
);
