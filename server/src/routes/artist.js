const router = require('express').Router();
const Joi = require('joi');
const { logged, validating } = require('../tools/middleware');
const db = require('../database');
const logger = require('../tools/logger');

const getArtist = Joi.object().keys({
  id: Joi.string().required(),
});

router.get('/:id', validating(getArtist, 'params'), logged, async (req, res) => {
  try {
    const { id } = req.values;
    const artist = await db.getArtist(id);
    if (!artist) {
      return res.status(404).end();
    }
    return res.status(200).send(artist);
  } catch (e) {
    logger.error(e);
    return res.status(500).end();
  }
});

router.get('/:id/stats', validating(getArtist, 'params'), logged, async (req, res) => {
  try {
    const { user } = req;
    const { id } = req.values;

    const artist = await db.getArtist(id);
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
    return res.status(200).send({
      artist, firstLast, mostListened, bestPeriod, total, rank,
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
