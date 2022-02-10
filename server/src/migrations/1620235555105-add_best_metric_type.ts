import { UserModel } from '../database/Models';

export const up = async () => {
  await UserModel.updateMany({}, { $set: { 'settings.metricUsed': 'number' } }, { multi: true });
};

export const down = async () => {
  await UserModel.updateMany({}, { $unset: { 'settings.metricUsed': '' } });
};
