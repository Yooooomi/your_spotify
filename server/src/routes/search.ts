import { Router } from 'express';
import { z } from 'zod';
import { searchArtist, searchTrack } from '../database';
import { logger } from '../tools/logger';
import { isLoggedOrGuest, validating } from '../tools/middleware';
import { TypedPayload } from '../tools/types';

const router = Router();
export default router;

const search = z.object({
  query: z.string().min(3).max(64),
});

router.get(
  '/:query',
  validating(search, 'params'),
  isLoggedOrGuest,
  async (req, res) => {
    const { query } = req.params as TypedPayload<typeof search>;

    try {
      const [artists, tracks] = await Promise.all([
        searchArtist(query),
        searchTrack(query),
      ]);
      return res.status(200).send({ artists, tracks });
    } catch (e) {
      logger.error(e);
      return res.status(500).end();
    }
  },
);
