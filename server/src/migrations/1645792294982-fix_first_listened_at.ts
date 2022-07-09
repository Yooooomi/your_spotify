import {
  getAllUsers,
  getFirstInfo,
  storeFirstListenedAtIfLess,
} from '../database';
import { startMigration } from '../tools/migrations';

export const up = async () => {
  startMigration('fixing first listened at');

  const users = await getAllUsers();

  await Promise.all(
    users.map(async user => {
      const firstInfo = await getFirstInfo(user._id.toString());
      if (firstInfo) {
        await storeFirstListenedAtIfLess(
          user._id.toString(),
          firstInfo.played_at,
        );
      }
    }),
  );
};

export const down = async () => {};
