import { Router } from 'express';
import { storeInUser } from '../database';
import { logger } from '../tools/logger';
import { logged, withHttpClient } from '../tools/middleware';
import { Spotify } from '../tools/oauth/Provider';
import { LoggedRequest, SpotifyRequest } from '../tools/types';

const router = Router();
export default router;

router.get('/spotify', (req, res) => res.redirect(Spotify.getRedirect()));

router.get('/spotify/callback', logged, async (req, res) => {
  const { user, query } = req as LoggedRequest;
  const { code } = query;

  const infos = await Spotify.exchangeCode(code as string);

  await storeInUser('_id', user._id, {
    ...infos,
    activated: true,
  });

  return res.redirect(process.env.CLIENT_ENDPOINT);
});

router.get('/spotify/me', logged, withHttpClient, async (req, res) => {
  const { client } = req as SpotifyRequest;

  try {
    const { data } = await client.get('/me');
    return res.status(200).send(data);
  } catch (e) {
    logger.error(e);
    return res.status(500).send({ code: 'SPOTIFY_ERROR' });
  }
});
