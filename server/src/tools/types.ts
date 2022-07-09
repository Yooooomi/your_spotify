import { Request } from 'express';
import { z } from 'zod';
import { GlobalPreferences } from '../database/schemas/globalPreference';
import { User } from '../database/schemas/user';
import { SpotifyAPI } from './spotifyApi';

export interface GlobalPreferencesRequest extends Request {
  globalPreferences: GlobalPreferences;
}

export type TypedPayload<T extends z.AnyZodObject> = z.infer<T>;

export interface LoggedRequest extends Request {
  user: User;
}

export interface OptionalLoggedRequest extends Request {
  user: User | null;
}

export interface SpotifyRequest extends Request {
  client: SpotifyAPI;
}

export enum Timesplit {
  all = 'all',
  hour = 'hour',
  day = 'day',
  week = 'week',
  month = 'month',
  year = 'year',
}

export type Unpack<T> = T extends (infer U)[] ? U : T;
