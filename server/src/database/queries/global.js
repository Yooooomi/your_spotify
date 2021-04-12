const { GlobalPreferences } = require('../Schemas');

const getGlobalPreferences = () => GlobalPreferences.findOne();

const updateGlobalPreferences = (modifications = {}) => GlobalPreferences
  .findOneAndUpdate({}, modifications, { new: true });

module.exports = {
  getGlobalPreferences,
  updateGlobalPreferences,
};
