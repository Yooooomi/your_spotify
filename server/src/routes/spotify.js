var express = require('express');
var router = express.Router();
const { logged, validating } = require('../tools/middleware');
const db = require('../database');
const Joi = require('joi');

const gethistorySchema = Joi.object().keys({
  number: Joi.number().max(20).required(),
  offset: Joi.number().required(),
});

router.get('/gethistory', validating(gethistorySchema, 'query'), logged, async (req, res) => {
  const { number, offset } = req.values;
  const { user } = req;

  const tracks = await db.getSongs(user._id, offset, number);
  return res.status(200).send(tracks);
});

const interval = Joi.object().keys({
  start: Joi.date().required(),
  end: Joi.date().default(() => new Date(), 'End date, defaulted to now'),
});

router.get('/listened_to', validating(interval, 'query'), logged, async (req, res) => {
  const { user } = req;
  const { start, end } = req.values;

  const result = await db.getSongsPer(user._id, start, end);
  console.log('Listened to ', result);
  if (result.length > 0) {
    return res.status(200).send({ count: result[0].count });
  } else {
    return res.status(200).send({ count: 0 });
  }
});

router.get('/most_listened', validating(interval, 'query'), logged, async (req, res) => {
  const { user } = req;
  const { start, end } = req.values;

  const result = await db.getMostListenedSongs(user._id, start, end);
  return res.status(200).send(result);
});

router.get('/most_listened_artist', validating(interval, 'query'), logged, async (req, res) => {
  const { user } = req;
  const { start, end } = req.values;

  const result = await db.getMostListenedArtist(user._id, start, end);
  return res.status(200).send(result);
});

const intervalPerSchema = Joi.object().keys({
  start: Joi.date().required(),
  end: Joi.date().default(() => new Date(), 'End date, defaulted to now'),
  timeSplit: Joi.string().only(['year', 'month', 'week', 'day', 'hour']).default('day'),
});

router.get('/songs_per', validating(intervalPerSchema, 'query'), logged, async (req, res) => {
  const { user } = req;
  const { start, end, timeSplit } = req.values;

  const result = await db.getSongsPer(user._id, start, end, timeSplit);
  return res.status(200).send(result);
});

router.get('/time_per', validating(intervalPerSchema, 'query'), logged, async (req, res) => {
  const { user } = req;
  const { start, end, timeSplit } = req.values;

  const result = await db.getTimePer(user._id, start, end, timeSplit);
  return res.status(200).send(result);
});

router.get('/album_date_ratio', validating(intervalPerSchema, 'query'), logged, async (req, res) => {
  const { user } = req;
  const { start, end, timeSplit } = req.values;

  const result = await db.albumDateRatio(user._id, start, end, timeSplit);
  return res.status(200).send(result);
});

router.get('/feat_ratio', validating(interval, 'query'), logged, async (req, res) => {
  const { user } = req;
  const { start, end } = req.values;

  const result = await db.featRatio(user._id, start, end);
  return res.status(200).send(result);
});

router.get('/popularity_per', validating(intervalPerSchema, 'query'), logged, async (req, res) => {
  const { user } = req;
  const { start, end, timeSplit } = req.values;

  const result = await db.popularityPer(user._id, start, end, timeSplit);
  return res.status(200).send(result);
});

module.exports = router;
