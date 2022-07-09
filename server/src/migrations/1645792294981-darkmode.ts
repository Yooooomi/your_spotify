import { changeSetting, getAllUsers, storeInUser } from '../database';
import { InfosModel } from '../database/Models';
import { startMigration } from '../tools/migrations';

export const up = async () => {
  startMigration('add dark mode');

  const users = await getAllUsers();
  await Promise.all(
    users.map(user =>
      changeSetting('_id', user._id, {
        darkMode: 'follow',
      }),
    ),
  );
  await Promise.all(
    users.map(async user => {
      const firstArray = await InfosModel.find({ owner: user._id })
        .sort('played_at')
        .limit(1);
      const [first] = firstArray;
      if (!first) {
        return;
      }
      await storeInUser('_id', user._id, {
        firstListenedAt: first.played_at,
      });
    }),
  );
};

export const down = async () => {};
