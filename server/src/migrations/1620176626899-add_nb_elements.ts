import { UserModel } from '../database/Models';

export const up = async () => {
  await UserModel.updateMany({}, { $set: { 'settings.nbElements': 10 } }, { multi: true });
};

export const down = async () => {
  await UserModel.updateMany({}, { $unset: { 'settings.nbElements': '' } });
};
