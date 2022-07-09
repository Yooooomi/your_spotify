import { UserModel } from '../database/Models';
import { startMigration } from '../tools/migrations';

export const up = async () => {
  startMigration('add best metric');
  await UserModel.updateMany(
    {},
    { $set: { 'settings.metricUsed': 'number' } },
    { multi: true },
  );
};

export const down = async () => {
  await UserModel.updateMany({}, { $unset: { 'settings.metricUsed': '' } });
};
