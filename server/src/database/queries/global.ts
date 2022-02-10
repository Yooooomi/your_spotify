import { GlobalPreferencesModel } from '../Models';

export const getGlobalPreferences = () => GlobalPreferencesModel.findOne();

export const updateGlobalPreferences = (modifications = {}) =>
  GlobalPreferencesModel.findOneAndUpdate({}, modifications, { new: true });
