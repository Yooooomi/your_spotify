import { Router } from 'express';
import { sign } from 'jsonwebtoken';
import {
  createUser,
  getNumberOfUsers,
  getUserFromField,
  storeInUser,
} from '../database';
import { get } from '../tools/env';
import { logger } from '../tools/logger';
import {
  logged,
  withGlobalPreferences,
  withHttpClient,
} from '../tools/middleware';
import { Spotify } from '../tools/oauth/Provider';
import { GlobalPreferencesRequest, SpotifyRequest } from '../tools/types';

const router = Router();
export default router;

router.get('/spotify', (req, res) => res.redirect(Spotify.getRedirect()));

router.get('/spotify/callback', withGlobalPreferences, async (req, res) => {
  const { query, globalPreferences } = req as GlobalPreferencesRequest;
  const { code } = query;

  const infos = await Spotify.exchangeCode(code as string);

  try {
    const client = Spotify.getHttpClient(infos.accessToken);
    const { data: spotifyMe } = await client.get('/me');
    let user = await getUserFromField('spotifyId', spotifyMe.id);
    if (!user) {
      if (!globalPreferences.allowRegistrations) {
        return res.redirect(`${get('CLIENT_ENDPOINT')}/registrations-disabled`);
      }
      const nbUsers = await getNumberOfUsers();
      user = await createUser(
        spotifyMe.display_name,
        spotifyMe.id,
        nbUsers === 0,
      );
    }
    await storeInUser('_id', user._id, infos);
    const token = sign({ userId: user._id.toString() }, 'MyPrivateKey', {
      expiresIn: '1h',
    });
    res.cookie('token', token);
  } catch (e) {
    logger.error(e);
  }
  return res.redirect(get('CLIENT_ENDPOINT'));
});

router.get('/spotify/me', logged, withHttpClient, async (req, res) => {
  const { client } = req as SpotifyRequest;

  try {
    const me = await client.me();
    return res.status(200).send(me);
  } catch (e) {
    logger.error(e);
    return res.status(500).send({ code: 'SPOTIFY_ERROR' });
  }
});
