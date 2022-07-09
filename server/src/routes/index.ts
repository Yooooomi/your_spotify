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

const router = Router();
export default router;

router.get('/', (req, res) => {
  res.status(200).send('Hello !');
});

router.post('/logout', async (req, res) => {
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

router.get('/accounts', isLoggedOrGuest, async (req, res) => {
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
