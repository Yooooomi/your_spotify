import { Router } from 'express';
import { z } from 'zod';
import { getAlbums } from '../database/queries/album';
import { logger } from '../tools/logger';
import { isLoggedOrGuest, validating } from '../tools/middleware';
import { TypedPayload } from '../tools/types';

const router = Router();
export default router;

const getAlbumsSchema = z.object({
  ids: z.string(),
});

router.get(
  '/:ids',
  validating(getAlbumsSchema, 'params'),
  isLoggedOrGuest,
  async (req, res) => {
    try {
      const { ids } = req.params as TypedPayload<typeof getAlbumsSchema>;
      const artists = await getAlbums(ids.split(','));
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
