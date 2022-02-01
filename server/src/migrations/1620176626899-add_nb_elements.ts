import { UserModel } from "../database/Models";

module.exports.up = async () => {
  await UserModel.updateMany(
    {},
    { $set: { "settings.nbElements": 10 } },
    { multi: true }
  );
};

module.exports.down = async () => {
  await UserModel.updateMany({}, { $unset: { "settings.nbElements": "" } });
};
