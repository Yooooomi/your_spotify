var express = require('express');
var router = express.Router();

const { Spotify } = require('../tools/oauth/Provider');

router.get('/spotify', (req, res) => {
  return res.redirect(Spotify.getRedirect());
});

router.get('/spotify/callback', async (req, res) => {
  const { query } = req;
  const { code } = query;

  const infos = await Spotify.exchangeCode(code);

  console.log(infos);

  // TODO store it in db

  return res.redirect('http://localhost:3000');
});

module.exports = router;
