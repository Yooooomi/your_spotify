import { Schema } from 'mongoose';

export interface GlobalPreferences {
  allowRegistrations: boolean;
}

export const GlobalPreferencesSchema = new Schema<GlobalPreferences>({
  allowRegistrations: { type: Boolean, default: true },
});
