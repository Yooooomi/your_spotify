import { Router } from 'express';
import { z } from 'zod';
import {
  getArtists,
  getFirstAndLastListened,
  getMostListenedSongOfArtist,
  bestPeriodOfArtist,
  getTotalListeningOfArtist,
  getRankOfArtist,
  searchArtist,
  getDayRepartitionOfArtist,
} from '../database';
import { logger } from '../tools/logger';
import { isLoggedOrGuest, validating } from '../tools/middleware';
import { LoggedRequest, TypedPayload } from '../tools/types';

const router = Router();
export default router;

const getArtistsSchema = z.object({
  ids: z.string(),
});

router.get(
  '/:ids',
  validating(getArtistsSchema, 'params'),
  isLoggedOrGuest,
  async (req, res) => {
    try {
      const { ids } = req.params as TypedPayload<typeof getArtistsSchema>;
      const artists = await getArtists(ids.split(','));
      if (!artists || artists.length === 0) {
        return res.status(404).end();
      }
      return res.status(200).send(artists);
    } catch (e) {
      logger.error(e);
      return res.status(500).end();
    }
  },
);

const getArtistStats = z.object({
  id: z.string(),
});

router.get(
  '/:id/stats',
  validating(getArtistStats, 'params'),
  isLoggedOrGuest,
  async (req, res) => {
    try {
      const { user } = req as LoggedRequest;
      const { id } = req.params as TypedPayload<typeof getArtistStats>;

      const artist = await getArtists([id]);
      if (!artist) {
        return res.status(404).end();
      }
      const promises = [
        getFirstAndLastListened(user, id),
        getMostListenedSongOfArtist(user, id),
        bestPeriodOfArtist(user, id),
        getTotalListeningOfArtist(user, id),
        getRankOfArtist(user, id),
        getDayRepartitionOfArtist(user, id),
      ];
      const [firstLast, mostListened, bestPeriod, total, rank, dayRepartition] =
        await Promise.all(promises);
      if (!total) {
        return res.status(200).send({
          code: 'NEVER_LISTENED',
        });
      }
      return res.status(200).send({
        artist: artist[0],
        firstLast,
        mostListened,
        bestPeriod,
        total,
        rank,
        dayRepartition,
      });
    } catch (e) {
      logger.error(e);
      return res.status(500).end();
    }
  },
);

const search = z.object({
  query: z.string().min(3).max(64),
});

router.get(
  '/search/:query',
  validating(search, 'params'),
  isLoggedOrGuest,
  async (req, res) => {
    const { query } = req.params as TypedPayload<typeof search>;

    try {
      const results = await searchArtist(query);
      return res.status(200).send(results);
    } catch (e) {
      return res.status(500).end();
    }
  },
);
