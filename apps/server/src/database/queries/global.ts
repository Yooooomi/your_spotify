import { GlobalPreferencesModel } from "../Models";
import { GlobalPreferences } from "../schemas/globalPreference";

export const getGlobalPreferences = () => GlobalPreferencesModel.findOne();

export const updateGlobalPreferences = (
  modifications: Partial<GlobalPreferences> = {},
) => GlobalPreferencesModel.findOneAndUpdate({}, modifications, { new: true });
