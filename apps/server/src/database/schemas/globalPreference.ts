import { Schema } from "mongoose";

export interface GlobalPreferences {
  allowRegistrations: boolean;
  allowAffinity: boolean;
}

export const GlobalPreferencesSchema = new Schema<GlobalPreferences>({
  allowRegistrations: { type: Boolean, default: true },
  allowAffinity: { type: Boolean, default: true },
});
