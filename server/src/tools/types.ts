import { Request } from "express";
import { GlobalPreferences } from "../database/schemas/globalPreference";
import { User } from "../database/schemas/user";

export interface GlobalPreferencesRequest extends Request {
  globalPreferences: GlobalPreferences;
}

export interface LoggedRequest extends Request {
  user: User;
}

export interface SpotifyRequest extends Request {
  client: any;
}

export enum Timesplit {
  all = "all",
  hour = "hour",
  day = "day",
  week = "week",
  month = "month",
  year = "year",
}
