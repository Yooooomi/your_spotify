import { Schema } from "mongoose";

export interface GlobalPreferences {
  allowRegistrations: boolean;
  allowAffinity: boolean;
  // 0 = Sunday, 1 = Monday, ... 6 = Saturday
  weekStartsOn?: number;
}

export const GlobalPreferencesSchema = new Schema<GlobalPreferences>({
  allowRegistrations: { type: Boolean, default: true },
  allowAffinity: { type: Boolean, default: true },
  weekStartsOn: { type: Number, min: 0, max: 6, default: 0 },
});
