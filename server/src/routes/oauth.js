var express = require('express');
var router = express.Router();
const { logged, withHttpClient } = require('../tools/middleware');
const { Spotify } = require('../tools/oauth/Provider');
const db = require('../database');

router.get('/spotify', (req, res) => {
  return res.redirect(Spotify.getRedirect());
});

router.get('/spotify/callback', logged, async (req, res) => {
  const { query } = req;
  const { code } = query;

  const infos = await Spotify.exchangeCode(code);

  await db.storeInUser('_id', req.user._id, {
    ...infos,
    activated: true,
  });

  return res.redirect('http://localhost:3000');
});

router.get('/spotify/me', logged, withHttpClient, async (req, res) => {
  const { client } = req;

  try {
    const { data } = await client.get('/me');
    return res.status(200).send(data);
  } catch (e) {
    console.error(e);
    return res.status(500).end();
  }
});

module.exports = router;
