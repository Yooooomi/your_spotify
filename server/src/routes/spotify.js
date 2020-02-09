var express = require('express');
var router = express.Router();
const { logged, validating, withHttpClient } = require('../tools/middleware');
const db = require('../database');
const Joi = require('joi');

const playSchema = Joi.object().keys({
  id: Joi.string().required(),
});

router.post('/play', validating(playSchema), logged, withHttpClient, async (req, res) => {
  const { client } = req;
  const { id } = req.values;

  try {
    const track = await db.Track.findOne({ id, });

    if (!track) return res.status(400).end();
    await client.put('https://api.spotify.com/v1/me/player/play', {
        uris: [track.uri],
      }
    );
    return res.status(200).end();
  } catch (e) {
    if (e.response) {
      console.error(e.response.data);
      return res.status(400).send(e.response.data.error);
    }
    else console.error(e);
    return res.status(500).end();
  }
});

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

const intervalPerSchema = Joi.object().keys({
  start: Joi.date().required(),
  end: Joi.date().default(() => new Date(), 'End date, defaulted to now'),
  timeSplit: Joi.string().only(['all', 'year', 'month', 'week', 'day', 'hour']).default('day'),
});

router.get('/listened_to', validating(interval, 'query'), logged, async (req, res) => {
  const { user } = req;
  const { start, end } = req.values;

  const result = await db.getSongsPer(user._id, start, end);
  ('Listened to ', result);
  if (result.length > 0) {
    return res.status(200).send({ count: result[0].count });
  } else {
    return res.status(200).send({ count: 0 });
  }
});

router.get('/most_listened', validating(intervalPerSchema, 'query'), logged, async (req, res) => {
  const { user } = req;
  const { start, end, timeSplit } = req.values;

  const result = await db.getMostListenedSongs(user._id, start, end, timeSplit);
  return res.status(200).send(result);
});

router.get('/most_listened_artist', validating(intervalPerSchema, 'query'), logged, async (req, res) => {
  const { user } = req;
  const { start, end, timeSplit } = req.values;

  const result = await db.getMostListenedArtist(user._id, start, end, timeSplit);
  return res.status(200).send(result);
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

router.get('/feat_ratio', validating(intervalPerSchema, 'query'), logged, async (req, res) => {
  const { user } = req;
  const { start, end, timeSplit } = req.values;

  const result = await db.featRatio(user._id, start, end, timeSplit);
  return res.status(200).send(result);
});

router.get('/popularity_per', validating(intervalPerSchema, 'query'), logged, async (req, res) => {
  const { user } = req;
  const { start, end, timeSplit } = req.values;

  const result = await db.popularityPer(user._id, start, end, timeSplit);
  return res.status(200).send(result);
});

router.get('/different_artists_per', validating(intervalPerSchema, 'query'), logged, async (req, res) => {
  const { user } = req;
  const { start, end, timeSplit } = req.values;

  const result = await db.differentArtistsPer(user._id, start, end, timeSplit);
  return res.status(200).send(result);
});

module.exports = router;
