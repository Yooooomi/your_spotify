import { NextFunction, Request, Response } from 'express';
import { AnyZodObject } from 'zod';
import { verify } from 'jsonwebtoken';
import { Types } from 'mongoose';
import { getUserFromField, storeInUser, getGlobalPreferences } from '../database';
import { logger } from './logger';
import { Spotify } from './oauth/Provider';
import { GlobalPreferencesRequest, LoggedRequest, SpotifyRequest } from './types';

type Location = 'body' | 'params' | 'query';

export const validating =
  (schema: AnyZodObject, location: Location = 'body') =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const value = schema.parse(req[location]);
      req[location] = value;
      return next();
    } catch (e) {
      logger.error(e);
      return res.status(400).end();
    }
  };

export const logged = async (req: Request, res: Response, next: NextFunction) => {
  const auth = req.cookies.token;

  if (!auth) return res.status(401).end();

  if (auth) {
    try {
      const userId = verify(auth, 'MyPrivateKey') as { userId: string };

      const user = await getUserFromField('_id', new Types.ObjectId(userId.userId), false);

      if (!user) {
        return res.status(401).end();
      }
      (req as any).user = user;
      return next();
    } catch (e) {
      return res.status(401).end();
    }
  }
  return res.status(401).end();
};

export const withHttpClient = async (req: Request, res: Response, next: NextFunction) => {
  const { user } = req as LoggedRequest;

  let tokens = {
    accessToken: user.accessToken,
    expiresIn: user.expiresIn,
  };

  if (user.expiresIn < Date.now()) {
    try {
      if (!user.refreshToken) {
        return;
      }
      const newTokens = await Spotify.refresh(user.refreshToken);
      await storeInUser('_id', user._id, newTokens);
      tokens = newTokens;
    } catch (e) {
      if (e.response) {
        logger.error(e.response.data);
      } else {
        logger.error(e);
      }
      return res.status(400).end();
    }
  }
  if (!tokens.accessToken) {
    logger.error(`There was an error with account ${user.username}`);
    return next();
  }
  const client = Spotify.getHttpClient(tokens.accessToken);
  (req as SpotifyRequest & LoggedRequest).client = client;
  return next();
};

export const withGlobalPreferences = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const pref = await getGlobalPreferences();
    if (!pref) {
      logger.error('No global preferences, this is critical, try restarting the app');
      return;
    }
    (req as GlobalPreferencesRequest).globalPreferences = pref;
    return next();
  } catch (e) {
    return res.status(500).end();
  }
};
