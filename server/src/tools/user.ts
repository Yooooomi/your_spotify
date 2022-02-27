/* eslint-disable no-await-in-loop */
import {
  deleteAllInfosFromUserId,
  deleteAllOrphanTracks,
  deleteUser as dbDeleteUser,
} from '../database';
import { longWriteDbLock } from './lock';
import { logger } from './logger';

export const deleteUser = async (userId: string) => {
  logger.info(`Deleting user ${userId}`);
  await longWriteDbLock.lock();
  await deleteAllInfosFromUserId(userId);
  await dbDeleteUser(userId);
  await deleteAllOrphanTracks();
  longWriteDbLock.unlock();
};
