import { GlobalPreferencesModel } from "../database/Models";

module.exports.up = async () => {
  await GlobalPreferencesModel.create({});
};

module.exports.down = async () => {
  await GlobalPreferencesModel.findOneAndDelete();
};
