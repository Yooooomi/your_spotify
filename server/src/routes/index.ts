import { Router } from 'express';
import { Types } from 'mongoose';
import { z } from 'zod';
import { v4 } from 'uuid';
import {
  admin,
  isLoggedOrGuest,
  logged,
  optionalLoggedOrGuest,
  validating,
} from '../tools/middleware';
import {
  changeSetting,
  getAllAdmins,
  getAllUsers,
  getUserFromField,
  setUserAdmin,
  setUserPublicToken,
  storeInUser,
} from '../database';
import { logger } from '../tools/logger';
import {
  LoggedRequest,
  OptionalLoggedRequest,
  TypedPayload,
} from '../tools/types';
import { toBoolean, toNumber } from '../tools/zod';
import { deleteUser } from '../tools/user';
import { GithubAPI } from '../tools/apis/githubApi';
import { Version } from '../tools/version';
import { getWithDefault } from '../tools/env';

const router = Router();
export default router;

router.get('/', (_, res) => {
  res.status(200).send('Hello !');
});

router.post('/logout', async (_, res) => {
  res.clearCookie('token');
  return res.status(200).end();
});

const settingsSchema = z.object({
  historyLine: z.string().transform(toBoolean).optional(),
  preferredStatsPeriod: z.enum(['day', 'week', 'month', 'year']).optional(),
  nbElements: z.preprocess(
    toNumber,
    z.number().min(5).max(50).default(10).optional(),
  ),
  metricUsed: z.enum(['number', 'duration']).optional(),
  darkMode: z.enum(['follow', 'dark', 'light']).optional(),
  timezone: z
    .string()
    .nullable()
    .transform(e => e ?? undefined)
    .optional(),
});

router.post(
  '/settings',
  validating(settingsSchema),
  logged,
  async (req, res) => {
    const { user } = req as LoggedRequest;

    try {
      await changeSetting(
        '_id',
        user._id,
        req.body as TypedPayload<typeof settingsSchema>,
      );
      return res.status(200).end();
    } catch (e) {
      logger.error(e);
      return res.status(500).end();
    }
  },
);

router.get('/me', optionalLoggedOrGuest, async (req, res) => {
  const { user } = req as OptionalLoggedRequest;
  if (user) {
    return res.status(200).send({ status: true, user });
  }
  return res.status(200).send({ status: false });
});

router.post('/generate-public-token', logged, async (req, res) => {
  const { user } = req as LoggedRequest;

  try {
    const token = v4();
    await setUserPublicToken(user._id.toString(), token);
    return res.status(200).send(token);
  } catch (e) {
    logger.error(e);
    return res.status(500).end();
  }
});

router.get('/accounts', isLoggedOrGuest, async (_, res) => {
  try {
    const users = await getAllUsers();
    return res.status(200).send(
      users.map(user => ({
        id: user._id.toString(),
        username: user.username,
        admin: user.admin,
        firstListenedAt: user.firstListenedAt,
      })),
    );
  } catch (e) {
    logger.error(e);
    return res.status(500).end();
  }
});

const setAdmin = z.object({
  id: z.string(),
});

const setAdminBody = z.object({
  status: z.preprocess(toBoolean, z.boolean()),
});

router.put(
  '/admin/:id',
  validating(setAdmin, 'params'),
  validating(setAdminBody),
  logged,
  admin,
  async (req, res) => {
    const { id } = req.params as TypedPayload<typeof setAdmin>;
    const { status } = req.body as TypedPayload<typeof setAdminBody>;

    try {
      const users = await getAllAdmins();
      if (users.length <= 1) {
        return res.status(400).send({ code: 'CANNOT_HAVE_ZERO_ADMIN' });
      }
      await setUserAdmin(id, status);
      return res.status(204).end();
    } catch (e) {
      logger.error(e);
      return res.status(500).end();
    }
  },
);

const deleteAccount = z.object({
  id: z.string(),
});

router.delete(
  '/account/:id',
  validating(deleteAccount, 'params'),
  logged,
  admin,
  async (req, res) => {
    const { id } = req.params as TypedPayload<typeof deleteAccount>;

    try {
      const user = await getUserFromField('_id', new Types.ObjectId(id));
      if (!user) {
        return res.status(404).end();
      }
      await deleteUser(id);
      return res.status(204).end();
    } catch (e) {
      logger.error(e);
      return res.status(500).end();
    }
  },
);

const rename = z.object({
  newName: z.string().max(64).min(2),
});

router.put('/rename', validating(rename), logged, async (req, res) => {
  const { user } = req as LoggedRequest;
  const { newName } = req.body as TypedPayload<typeof rename>;

  try {
    await storeInUser('_id', user._id, { username: newName });
    return res.status(204).end();
  } catch (e) {
    logger.error(e);
    return res.status(500).end();
  }
});

router.get('/version', logged, async (_, res) => {
  if (getWithDefault('NODE_ENV', 'development') === 'development') {
    return res.status(200).send({ update: false, version: '1.0.0' });
  }
  try {
    const version = await GithubAPI.lastVersion();
    if (!version) {
      return res.status(200).send({ update: false, version: '1.0.0' });
    }
    if (version.isNewerThan(Version.thisOne())) {
      return res
        .status(200)
        .send({ update: true, version: version.toString() });
    }
    return res.status(200).send({ update: false, version: version.toString() });
  } catch (e) {
    logger.error(e);
    return res.status(500).end();
  }
});
