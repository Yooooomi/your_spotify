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
    const { user } = req;
    const { id } = req.values;

    const artist = await db.getArtist(id);
    if (!artist) {
      return res.status(404).end();
    }
    const firstLast = await db.getFirstAndLastListened(user, id);
    const mostListened = await db.getMostListenedSongOfArtist(user, id);
    const bestPeriod = await db.bestPeriodOfArtist(user, id);
    const total = await db.getTotalListeningOfArtist(user, id);
    return res.status(200).send({
      artist, firstLast, mostListened, bestPeriod, total,
    });
  } catch (e) {
    logger.error(e);
    return res.status(500).end();
  }
});

module.exports = router;
