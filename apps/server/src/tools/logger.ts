import { logLevel } from "./env";

export const LogLevelToNumber = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
} as const;
type LogLevel = keyof typeof LogLevelToNumber;

export function LogLevelAccepts(wantedLogLevel: LogLevel) {
  return LogLevelToNumber[logLevel] <= LogLevelToNumber[wantedLogLevel];
}

export const logger = {
  debug: (...args: any) =>
    LogLevelToNumber[logLevel] <= 0 &&
    console.log(`[debug] [${new Date().toLocaleString()}]`, ...args),
  info: (...args: any) =>
    LogLevelToNumber[logLevel] <= 1 &&
    console.log(`[info] [${new Date().toLocaleString()}]`, ...args),
  warn: (...args: any) =>
    LogLevelToNumber[logLevel] <= 2 &&
    console.warn(`[warn] [${new Date().toLocaleString()}]`, ...args),
  error: (...args: any) =>
    LogLevelToNumber[logLevel] <= 3 &&
    console.error(`[error] [${new Date().toLocaleString()}]`, ...args),
};
