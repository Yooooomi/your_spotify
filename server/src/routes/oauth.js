var express = require('express');
var router = express.Router();
const { logged } = require('../tools/middleware');
const { Spotify } = require('../tools/oauth/Provider');
const db = require('../database');

router.get('/spotify', (req, res) => {
  return res.redirect(Spotify.getRedirect());
});

router.get('/spotify/callback', logged, async (req, res) => {
  const { query } = req;
  const { code } = query;

  const infos = await Spotify.exchangeCode(code);

  console.log(infos, req.user);

  await db.storeInUser('_id', req.user._id, {
    ...infos,
    activated: true,
  });

  return res.redirect('http://localhost:3000');
});

module.exports = router;
