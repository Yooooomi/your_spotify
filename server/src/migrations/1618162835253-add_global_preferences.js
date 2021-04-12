const db = require('../database');

module.exports.up = async () => {
  await db.GlobalPreferences.create({});
};

module.exports.down = async () => {
  await db.GlobalPreferences.findOneAndDelete();
};
