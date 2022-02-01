import { UserModel } from "../database/Models";

module.exports.up = async () => {
  await UserModel.updateMany(
    {},
    { $set: { "settings.metricUsed": "number" } },
    { multi: true }
  );
};

module.exports.down = async () => {
  await UserModel.updateMany({}, { $unset: { "settings.metricUsed": "" } });
};
