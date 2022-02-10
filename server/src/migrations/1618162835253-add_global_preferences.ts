import { GlobalPreferencesModel } from '../database/Models';

export const up = async () => {
  await GlobalPreferencesModel.create({});
};

export const down = async () => {
  await GlobalPreferencesModel.findOneAndDelete();
};
