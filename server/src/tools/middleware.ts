import { NextFunction, Request, Response } from 'express';
import { AnyZodObject, z } from 'zod';
import { verify } from 'jsonwebtoken';
import { Types } from 'mongoose';
import { getUserFromField, getGlobalPreferences } from '../database';
import { logger } from './logger';
import {
  GlobalPreferencesRequest,
  LoggedRequest,
  OptionalLoggedRequest,
  SpotifyRequest,
} from './types';
import { getUserImporterState } from '../database/queries/importer';
import { SpotifyAPI } from './spotifyApi';

type Location = 'body' | 'params' | 'query';

export const validating =
  (schema: AnyZodObject, location: Location = 'body') =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const value = schema
        .merge(z.object({ token: z.string().optional() }))
        .parse(req[location]);
      req[location] = value;
      return next();
    } catch (e) {
      logger.error(e);
      return res.status(400).end();
    }
  };

const baselogged = async (req: Request, useQueryToken = false) => {
  const auth = req.cookies.token;

  if (!auth && useQueryToken) {
    const { token } = req.query;
    if (!token) {
      return null;
    }
    const user = await getUserFromField('publicToken', token, false);
    if (!user) {
      return null;
    }
    return user;
  }
  if (!auth) return null;

  if (auth) {
    try {
      const userId = verify(auth, 'MyPrivateKey') as { userId: string };

      const user = await getUserFromField(
        '_id',
        new Types.ObjectId(userId.userId),
        false,
      );

      if (!user) {
        return null;
      }
      return user;
    } catch (e) {
      return null;
    }
  }
  return null;
};

export const logged = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const user = await baselogged(req, false);
  if (!user) {
    return res.status(401).end();
  }
  (req as LoggedRequest).user = user;
  return next();
};

export const isLoggedOrGuest = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const user = await baselogged(req, true);
  if (!user) {
    return res.status(401).end();
  }
  (req as LoggedRequest).user = user;
  return next();
};

export const optionalLoggedOrGuest = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const user = await baselogged(req, true);
  (req as OptionalLoggedRequest).user = user;
  return next();
};

export const optionalLogged = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const user = await baselogged(req, false);
  (req as OptionalLoggedRequest).user = user;
  return next();
};

export const admin = (req: Request, res: Response, next: NextFunction) => {
  const { user } = req as LoggedRequest;

  if (!user || !user.admin) {
    return res.status(401).end();
  }
  return next();
};

export const withHttpClient = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { user } = req as LoggedRequest;

  const client = new SpotifyAPI(user._id.toString());
  (req as SpotifyRequest & LoggedRequest).client = client;
  return next();
};

export const withGlobalPreferences = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const pref = await getGlobalPreferences();
    if (!pref) {
      logger.error(
        'No global preferences, this is critical, try restarting the app',
      );
      return;
    }
    (req as GlobalPreferencesRequest).globalPreferences = pref;
    return next();
  } catch (e) {
    return res.status(500).end();
  }
};

export const notAlreadyImporting = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { user } = req as LoggedRequest;
  const imports = await getUserImporterState(user._id.toString());
  if (imports.some(imp => imp.status === 'progress')) {
    return res.status(400).send({ code: 'ALREADY_IMPORTING' });
  }
  return next();
};
