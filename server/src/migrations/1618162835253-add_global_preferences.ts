import { GlobalPreferencesModel } from '../database/Models';
import { startMigration } from '../tools/migrations';

export const up = async () => {
  startMigration('Global preferences');
  await GlobalPreferencesModel.create({});
};

export const down = async () => {
  await GlobalPreferencesModel.findOneAndDelete();
};
