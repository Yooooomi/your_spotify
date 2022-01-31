export interface User {
  username: string;
  password: string;
  _id: string;
  id: string;
  expiresIn: number;
  accessToken: string;
  refreshToken: string;
  activated: boolean;
  lastTimestamp: number;
  tracks: string[];
  settings: {
    historyLine: boolean;
    preferredStatsPeriod: string;
    nbElements: number;
    metricUsed: "number" | "duration";
  };
}
