import { UserModel } from '../database/Models';
import { startMigration } from '../tools/migrations';

export const up = async () => {
  startMigration('nb elements in user');
  await UserModel.updateMany(
    {},
    { $set: { 'settings.nbElements': 10 } },
    { multi: true },
  );
};

export const down = async () => {
  await UserModel.updateMany({}, { $unset: { 'settings.nbElements': '' } });
};
