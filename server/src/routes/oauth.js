const express = require('express');

const router = express.Router();
const { logged, withHttpClient } = require('../tools/middleware');
const { Spotify } = require('../tools/oauth/Provider');
const db = require('../database');
const logger = require('../tools/logger');

router.get('/spotify', (req, res) => res.redirect(Spotify.getRedirect()));

router.get('/spotify/callback', logged, async (req, res) => {
  const { query } = req;
  const { code } = query;

  const infos = await Spotify.exchangeCode(code);

  await db.storeInUser('_id', req.user._id, {
    ...infos,
    activated: true,
  });

  return res.redirect(process.env.CLIENT_ENDPOINT);
});

router.get('/spotify/me', logged, withHttpClient, async (req, res) => {
  const { client } = req;

  try {
    const { data } = await client.get('/me');
    return res.status(200).send(data);
  } catch (e) {
    logger.error(e);
    return res.status(500).end({ code: 'SPOTIFY_ERROR' });
  }
});

module.exports = router;
