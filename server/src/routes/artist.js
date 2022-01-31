const router = require('express').Router();
const Joi = require('joi');
const { logged, validating } = require('../tools/middleware');
const db = require('../database');
const logger = require('../tools/logger');

const getArtists = Joi.object().keys({
  ids: Joi.string().required(),
});

router.get('/:ids', validating(getArtists, 'params'), logged, async (req, res) => {
  try {
    const { ids } = req.values;
    const artists = await db.getArtists(ids.split(','));
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
    const { user } = req;
    const { id } = req.values;

    const artist = await db.getArtists([id]);
    if (!artist) {
      return res.status(404).end();
    }
    const promises = [
      db.getFirstAndLastListened(user, id),
      db.getMostListenedSongOfArtist(user, id),
      db.bestPeriodOfArtist(user, id),
      db.getTotalListeningOfArtist(user, id),
      db.getRankOfArtist(user, id),
    ];
    const [
      firstLast,
      mostListened,
      bestPeriod,
      total,
      rank,
    ] = await Promise.all(promises);
    if (!total) {
      return res.status(200).send({
        code: 'NEVER_LISTENED',
      });
    }
    return res.status(200).send({
      artist: artist[0], firstLast, mostListened, bestPeriod, total, rank,
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
  const { query } = req.values;

  try {
    const results = await db.searchArtist(query);
    return res.status(200).send(results);
  } catch (e) {
    return res.status(500).end();
  }
});

module.exports = router;
