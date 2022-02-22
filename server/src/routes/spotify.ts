import { Router } from 'express';
import { z } from 'zod';
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
import { SpotifyRequest, LoggedRequest, Timesplit, TypedPayload } from '../tools/types';
import { toDate, toNumber } from '../tools/zod';

const router = Router();
export default router;

const playSchema = z.object({
  id: z.string(),
});

router.post('/play', validating(playSchema), logged, withHttpClient, async (req, res) => {
  const { client } = req as SpotifyRequest;
  const { id } = req.body as TypedPayload<typeof playSchema>;

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

const gethistorySchema = z.object({
  number: z.preprocess(toNumber, z.number().max(20)),
  offset: z.preprocess(toNumber, z.number()),
  start: z.preprocess(toDate, z.date().optional()),
  end: z.preprocess(toDate, z.date().optional()),
});

router.get('/gethistory', validating(gethistorySchema, 'query'), logged, async (req, res) => {
  const { user } = req as LoggedRequest;
  const { number, offset, start, end } = req.query as TypedPayload<typeof gethistorySchema>;

  const tracks = await getSongs(
    user._id.toString(),
    offset,
    number,
    start && end ? { start, end } : undefined,
  );
  return res.status(200).send(tracks);
});

const interval = z.object({
  start: z.preprocess(toDate, z.date()),
  end: z.preprocess(
    toDate,
    z.date().default(() => new Date()),
  ),
});

const intervalPerSchema = z.object({
  start: z.preprocess(toDate, z.date()),
  end: z.preprocess(
    toDate,
    z.date().default(() => new Date()),
  ),
  timeSplit: z.nativeEnum(Timesplit).default(Timesplit.day),
});

router.get('/listened_to', validating(interval, 'query'), logged, async (req, res) => {
  const { user } = req as LoggedRequest;
  const { start, end } = req.query as TypedPayload<typeof interval>;

  const result = await getSongsPer(user, start, end);
  if (result.length > 0) {
    return res.status(200).send({ count: result[0].count });
  }
  return res.status(200).send({ count: 0 });
});

router.get('/most_listened', validating(intervalPerSchema, 'query'), logged, async (req, res) => {
  const { user } = req as LoggedRequest;
  const { start, end, timeSplit } = req.query as TypedPayload<typeof intervalPerSchema>;

  const result = await getMostListenedSongs(user, start, end, timeSplit);
  return res.status(200).send(result);
});

router.get(
  '/most_listened_artist',
  validating(intervalPerSchema, 'query'),
  logged,
  async (req, res) => {
    const { user } = req as LoggedRequest;
    const { start, end, timeSplit } = req.query as TypedPayload<typeof intervalPerSchema>;

    const result = await getMostListenedArtist(user, start, end, timeSplit);
    return res.status(200).send(result);
  },
);

router.get('/songs_per', validating(intervalPerSchema, 'query'), logged, async (req, res) => {
  const { user } = req as LoggedRequest;
  const { start, end, timeSplit } = req.query as TypedPayload<typeof intervalPerSchema>;

  const result = await getSongsPer(user, start, end, timeSplit);
  return res.status(200).send(result);
});

router.get('/time_per', validating(intervalPerSchema, 'query'), logged, async (req, res) => {
  const { user } = req as LoggedRequest;
  const { start, end, timeSplit } = req.query as TypedPayload<typeof intervalPerSchema>;

  const result = await getTimePer(user, start, end, timeSplit);
  return res.status(200).send(result);
});

router.get(
  '/album_date_ratio',
  validating(intervalPerSchema, 'query'),
  logged,
  async (req, res) => {
    const { user } = req as LoggedRequest;
    const { start, end, timeSplit } = req.query as TypedPayload<typeof intervalPerSchema>;

    const result = await albumDateRatio(user, start, end, timeSplit);
    return res.status(200).send(result);
  },
);

router.get('/feat_ratio', validating(intervalPerSchema, 'query'), logged, async (req, res) => {
  const { user } = req as LoggedRequest;
  const { start, end, timeSplit } = req.query as TypedPayload<typeof intervalPerSchema>;

  const result = await featRatio(user, start, end, timeSplit);
  return res.status(200).send(result);
});

router.get('/popularity_per', validating(intervalPerSchema, 'query'), logged, async (req, res) => {
  const { user } = req as LoggedRequest;
  const { start, end, timeSplit } = req.query as TypedPayload<typeof intervalPerSchema>;

  const result = await popularityPer(user, start, end, timeSplit);
  return res.status(200).send(result);
});

router.get(
  '/different_artists_per',
  validating(intervalPerSchema, 'query'),
  logged,
  async (req, res) => {
    const { user } = req as LoggedRequest;
    const { start, end, timeSplit } = req.query as TypedPayload<typeof intervalPerSchema>;

    const result = await differentArtistsPer(user, start, end, timeSplit);
    return res.status(200).send(result);
  },
);

router.get('/time_per_hour_of_day', validating(interval, 'query'), logged, async (req, res) => {
  const { user } = req as LoggedRequest;
  const { start, end } = req.query as TypedPayload<typeof interval>;

  const result = await getDayRepartition(user, start, end);
  return res.status(200).send(result);
});

router.get(
  '/best_artists_per',
  validating(intervalPerSchema, 'query'),
  logged,
  async (req, res) => {
    const { user } = req as LoggedRequest;
    const { start, end, timeSplit } = req.query as TypedPayload<typeof intervalPerSchema>;

    const result = await getBestArtistsPer(user, start, end, timeSplit);
    return res.status(200).send(result);
  },
);

const intervalPerSchemaNbOffset = z.object({
  start: z.preprocess(toDate, z.date()),
  end: z.preprocess(
    toDate,
    z.date().default(() => new Date()),
  ),
  nb: z.preprocess(toNumber, z.number().min(1).max(30)),
  offset: z.preprocess(toNumber, z.number().min(0).default(0)),
});

router.get(
  '/top/songs',
  validating(intervalPerSchemaNbOffset, 'query'),
  logged,
  async (req, res) => {
    const { user } = req as LoggedRequest;
    const { start, end, nb, offset } = req.query as TypedPayload<typeof intervalPerSchemaNbOffset>;

    const result = await getBestSongsNbOffseted(user, start, end, nb, offset);
    return res.status(200).send(result);
  },
);

router.get(
  '/top/artists',
  validating(intervalPerSchemaNbOffset, 'query'),
  logged,
  async (req, res) => {
    const { user } = req as LoggedRequest;
    const { start, end, nb, offset } = req.query as TypedPayload<typeof intervalPerSchemaNbOffset>;

    const result = await getBestArtistsNbOffseted(user, start, end, nb, offset);
    return res.status(200).send(result);
  },
);

router.get(
  '/top/albums',
  validating(intervalPerSchemaNbOffset, 'query'),
  logged,
  async (req, res) => {
    const { user } = req as LoggedRequest;
    const { start, end, nb, offset } = req.query as TypedPayload<typeof intervalPerSchemaNbOffset>;

    const result = await getBestAlbumsNbOffseted(user, start, end, nb, offset);
    return res.status(200).send(result);
  },
);
