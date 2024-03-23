import { Interval } from "../../../intervals";

export type DarkModeType = "light" | "dark" | "follow";
export interface User {
  username: string;
  admin: boolean;
  _id: string;
  id: string;
  expiresIn: number;
  accessToken: string;
  refreshToken: string;
  lastTimestamp: number;
  tracks: string[];
  settings: {
    historyLine: boolean;
    preferredStatsPeriod: string;
    nbElements: number;
    metricUsed: "number" | "duration";
    darkMode: DarkModeType;
    timezone: string | null | undefined;
    dateFormat: string;
    blacklistedArtists: string[] | undefined;
  };
  publicToken: string | null;
  firstListenedAt: string;
  isGuest: boolean;
}

export interface ReduxPresetIntervalDetail {
  type: "preset";
  index: number;
}

export interface ReduxCustomIntervalDetail {
  type: "custom";
  interval: Interval;
}

export interface ReduxUserBasedIntervalDetails {
  type: "userbased";
  index: number;
}

export type ReduxIntervalDetail =
  | ReduxPresetIntervalDetail
  | ReduxCustomIntervalDetail
  | ReduxUserBasedIntervalDetails;
