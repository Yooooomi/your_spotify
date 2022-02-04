import { Router } from 'express';
import Joi from 'joi';
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
import { logged, validating } from '../tools/middleware';
import { LoggedRequest } from '../tools/types';

const router = Router();
export default router;

const getArtistsSchema = Joi.object().keys({
  ids: Joi.string().required(),
});

router.get('/:ids', validating(getArtistsSchema, 'params'), logged, async (req, res) => {
  try {
    const { ids } = req.params;
    const artists = await getArtists(ids.split(','));
    if (!artists || artists.length === 0) {
      return res.status(404).end();
    }
    return res.status(200).send(artists);
  } catch (e) {
    logger.error(e);
    return res.status(500).end();
  }
});

const getArtistStats = Joi.object().keys({
  id: Joi.string().required(),
});

router.get('/:id/stats', validating(getArtistStats, 'params'), logged, async (req, res) => {
  try {
    const { user } = req as LoggedRequest;
    const { id } = req.params;

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
    const [firstLast, mostListened, bestPeriod, total, rank, dayRepartition] = await Promise.all(
      promises,
    );
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
});

const search = Joi.object().keys({
  query: Joi.string().min(3).max(64).required(),
});

router.get('/search/:query', validating(search, 'params'), logged, async (req, res) => {
  const { query } = req.params;

  try {
    const results = await searchArtist(query);
    return res.status(200).send(results);
  } catch (e) {
    return res.status(500).end();
  }
});

module.exports = router;
