import { Schema, Types } from 'mongoose';

export interface User {
  _id: Types.ObjectId;
  username: string;
  password: string;
  spotifyId: string | null;
  expiresIn: number;
  accessToken: string | null;
  refreshToken: string | null;
  activated: boolean;
  lastTimestamp: number;
  tracks: Types.ObjectId[];
  settings: {
    historyLine: boolean;
    preferredStatsPeriod: string;
    nbElements: number;
    metricUsed: 'number' | 'duration';
  };
}

export const UserSchema = new Schema<User>(
  {
    username: { type: String, required: true },
    password: { type: String, required: true },
    spotifyId: { type: String, default: null },
    expiresIn: { type: Number, default: 0 },
    accessToken: { type: String, default: null },
    refreshToken: { type: String, default: null },
    activated: { type: Boolean, default: false },
    lastTimestamp: { type: Number, default: 0 },
    tracks: {
      type: [Types.ObjectId],
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
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } },
);
