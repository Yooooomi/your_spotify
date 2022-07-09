import { Schema, Types } from 'mongoose';

export type DarkModeType = 'follow' | 'dark' | 'light';

export interface User {
  _id: Types.ObjectId;
  username: string;
  admin: boolean;
  spotifyId: string | null;
  expiresIn: number;
  accessToken: string | null;
  refreshToken: string | null;
  lastTimestamp: number;
  tracks: Schema.Types.ObjectId[];
  settings: {
    historyLine: boolean;
    preferredStatsPeriod: string;
    nbElements: number;
    metricUsed: 'number' | 'duration';
    darkMode: DarkModeType;
  };
  lastImport: string | null;
  publicToken: string | null;
  firstListenedAt?: Date;
}

export const UserSchema = new Schema<User>(
  {
    username: { type: String, required: true },
    admin: { type: Boolean, default: false },
    spotifyId: { type: String, required: true, unique: true, index: true },
    expiresIn: { type: Number, default: 0 },
    accessToken: { type: String, default: null },
    refreshToken: { type: String, default: null },
    lastTimestamp: { type: Number, default: 0 },
    tracks: {
      type: [Schema.Types.ObjectId],
      ref: 'Infos',
      select: false,
      default: [],
    },
    settings: {
      historyLine: { type: Boolean, default: true },
      preferredStatsPeriod: { type: String, default: 'day' },
      nbElements: { type: Number, default: 10 },
      metricUsed: {
        type: String,
        enum: ['number', 'duration'],
        default: 'number',
      },
      darkMode: {
        type: String,
        enum: ['follow', 'dark', 'light'],
        default: 'follow',
      },
    },
    lastImport: { type: String, default: null },
    publicToken: { type: String, default: null, index: true },
    firstListenedAt: { type: Date },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } },
);
