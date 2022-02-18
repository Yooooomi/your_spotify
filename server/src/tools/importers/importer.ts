import { unlink } from 'fs/promises';
import { User } from '../../database/schemas/user';
import { refreshIfNeeded } from '../../spotify/dbTools';
import { logger } from '../logger';
import { clearCache } from './cache';
import { PrivacyImporter } from './privacy';
import { HistoryImporter } from './types';

const importers: Record<string, (user: User) => HistoryImporter> = {
  privacy: (user: User) => new PrivacyImporter(user),
} as const;

const userImporters: Record<string, HistoryImporter> = {};

export function getImport(userId: string): HistoryImporter | undefined {
  return userImporters[userId];
}

export function canUserImport(userId: string) {
  return !(userId in userImporters);
}

export async function runImporter(
  name: typeof importers[number]['name'],
  user: User,
  filePaths: string[],
  initDone: (success: boolean) => void,
) {
  const userId = user._id.toString();
  const importerClass = importers[name];
  if (!importerClass) {
    logger.error(`${name} importer was not found`);
    return;
  }
  const newUser = await refreshIfNeeded(user);
  if (!newUser) {
    logger.error(`Could not refresh token for ${user.username}`);
    return;
  }
  user = newUser;
  if (!user.accessToken) {
    logger.error(`No access token for ${user.username}`);
    return;
  }
  const instance = importerClass(user);
  if (userId in userImporters) {
    return;
  }
  userImporters[userId] = instance;
  clearCache(userId);
  try {
    const inited = await instance.init(filePaths);
    initDone(inited);
    await instance.run();
    await Promise.all(filePaths.map((f) => unlink(f)));
  } catch (e) {
    logger.error(e);
  }
  clearCache(userId);
  delete userImporters[userId];
}
