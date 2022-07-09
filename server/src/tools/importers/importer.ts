import { getUserFromField } from '../../database';
import {
  createImporterState,
  getImporterState,
  setImporterStateStatus,
} from '../../database/queries/importer';
import { User } from '../../database/schemas/user';
import { logger } from '../logger';
import { clearCache } from './cache';
import { FullPrivacyImporter } from './full_privacy';
import { PrivacyImporter } from './privacy';
import {
  HistoryImporter,
  ImporterStateFromType,
  ImporterStateTypes,
} from './types';

const importers: {
  [typ in ImporterStateTypes]: (user: User) => HistoryImporter<typ>;
} = {
  privacy: (user: User) => new PrivacyImporter(user),
  'full-privacy': (user: User) => new FullPrivacyImporter(user),
} as const;

const userImporters: {
  [userId: string]: HistoryImporter<any>;
} = {};

export function canUserImport(userId: string) {
  return !(userId in userImporters);
}
export async function cleanupImport(existingStateId: string) {
  const importState = await getImporterState(existingStateId);
  if (!importState) {
    return;
  }
  const { type, status } = importState;
  if (status !== 'failure') {
    return;
  }
  await setImporterStateStatus(existingStateId, 'failure-removed');
  const instanceClass = importers[type];
  if (!instanceClass) {
    return;
  }
  const user = await getUserFromField('_id', importState._id);
  if (!user) {
    return;
  }
  const instance = instanceClass(user);
  try {
    await instance.cleanup(importState.metadata);
  } catch (e) {
    // nothing
  }
}

export async function runImporter<T extends ImporterStateTypes>(
  existingStateId: string | null,
  name: T,
  user: User,
  requiredInitData: ImporterStateFromType<T>['metadata'],
  initDone: (success: boolean) => void,
) {
  const userId = user._id.toString();
  const importerClass = importers[name];
  if (!importerClass) {
    logger.error(`${name} importer was not found`);
    return initDone(false);
  }
  if (!user.accessToken || !user.refreshToken) {
    logger.error(`User ${user.username} has no accessToken or no refreshToken`);
    return initDone(false);
  }
  const instance = importerClass(user) as unknown as HistoryImporter<T>;
  if (userId in userImporters) {
    return initDone(false);
  }
  userImporters[userId] = instance;
  clearCache(userId);
  let existingState: ImporterStateFromType<T> | null = null;
  try {
    if (existingStateId) {
      existingState = (await getImporterState<T>(existingStateId)) ?? null;
    }
    const initedMetadata = await instance.init(existingState, requiredInitData);
    if (!initedMetadata) {
      if (existingState) {
        await cleanupImport(existingState._id.toString());
      }
      return initDone(false);
    }
    if (existingState) {
      await setImporterStateStatus(existingState._id.toString(), 'progress');
    }
    if (!existingState) {
      const data = {
        type: name,
        current: 0,
        total: initedMetadata.total,
        metadata: requiredInitData,
        status: 'progress',
      } as ImporterStateFromType<T>;
      existingState = (await createImporterState<T>(
        userId,
        data,
      )) as any as ImporterStateFromType<T>;
    }
    initDone(true);
    await instance.run(existingState._id.toString());
    await instance.cleanup(requiredInitData);
    await setImporterStateStatus(existingState._id.toString(), 'success');
  } catch (e) {
    if (existingState) {
      await setImporterStateStatus(existingState._id.toString(), 'failure');
    }
    logger.error(e);
    logger.error(
      'This import failed, but metadata is kept so that you can retry it later in the settings',
    );
  }
  clearCache(userId);
  delete userImporters[userId];
}
