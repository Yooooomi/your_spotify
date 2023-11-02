import { Router } from 'express';
import { z } from 'zod';
import {
  getArtists,
  getRankOfTrack,
  getTracks,
  getTrackListenedCount,
  getTrackFirstAndLastListened,
  bestPeriodOfTrack,
  getTrackRecentHistory,
} from '../database';
import { getAlbums } from '../database/queries/album';
import { logger } from '../tools/logger';
import { isLoggedOrGuest, validating } from '../tools/middleware';
import { LoggedRequest, TypedPayload } from '../tools/types';

const router = Router();
export default router;

const getTracksSchema = z.object({
  ids: z.string(),
});

router.get(
  '/:ids',
  validating(getTracksSchema, 'params'),
  isLoggedOrGuest,
  async (req, res) => {
    try {
      const { ids } = req.params as TypedPayload<typeof getTracksSchema>;
      const tracks = await getTracks(ids.split(','));
      if (!tracks || tracks.length === 0) {
        return res.status(404).end();
      }
      return res.status(200).send(tracks);
    } catch (e) {
      logger.error(e);
      return res.status(500).end();
    }
  },
);

const getTrackStats = z.object({
  id: z.string(),
});

router.get(
  '/:id/stats',
  validating(getTrackStats, 'params'),
  isLoggedOrGuest,
  async (req, res) => {
    try {
      const { user } = req as LoggedRequest;
      const { id } = req.params as TypedPayload<typeof getTrackStats>;
      const [track] = await getTracks([id]);
      const [trackArtist] = track?.artists ?? [];
      if (!track || !trackArtist) {
        return res.status(404).end();
      }
      const promises = [
        getAlbums([track.album]),
        getTrackListenedCount(user, id),
        getArtists([trackArtist]),
        getTrackFirstAndLastListened(user, track.id),
        bestPeriodOfTrack(user, track.id),
        getTrackRecentHistory(user, track.id),
      ];
      const [[album], count, [artist], firstLast, bestPeriod, recentHistory] =
        await Promise.all(promises);
      if (!count) {
        return res.status(200).send({ code: 'NEVER_LISTENED' });
      }
      return res.status(200).send({
        track,
        artist,
        album,
        bestPeriod,
        firstLast,
        recentHistory,
        total: {
          count,
        },
      });
    } catch (e) {
      logger.error(e);
      return res.status(500).end();
    }
  },
);

router.get(
  '/:id/rank',
  validating(getTrackStats, 'params'),
  isLoggedOrGuest,
  async (req, res) => {
    const { user } = req as LoggedRequest;
    const { id } = req.params as TypedPayload<typeof getTrackStats>;

    try {
      const [track] = await getTracks([id]);
      if (!track) {
        return res.status(404).end();
      }
      const rank = await getRankOfTrack(user, id);
      return res.status(200).send(rank);
    } catch (e) {
      logger.error(e);
      return res.status(500).end();
    }
  },
);
