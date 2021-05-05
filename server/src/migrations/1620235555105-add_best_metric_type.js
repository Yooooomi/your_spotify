const db = require('../database');

module.exports.up = async () => {
  await db.User.updateMany({}, { $set: { 'settings.metricUsed': 'number' } }, { multi: true });
};

module.exports.down = async () => {
  await db.User.updateMany({}, { $unset: { 'settings.metricUsed': '' } });
};
