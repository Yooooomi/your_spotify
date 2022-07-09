import { getWithDefault } from './env';

const levelToNumber = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

export const logger = {
  debug: (...args: any) =>
    levelToNumber[getWithDefault('LOG_LEVEL', 'info')] <= 0 &&
    console.log('[debug] ', ...args),
  info: (...args: any) =>
    levelToNumber[getWithDefault('LOG_LEVEL', 'info')] <= 1 &&
    console.log('[info] ', ...args),
  warn: (...args: any) =>
    levelToNumber[getWithDefault('LOG_LEVEL', 'info')] <= 2 &&
    console.warn('[warn] ', ...args),
  error: (...args: any) =>
    levelToNumber[getWithDefault('LOG_LEVEL', 'info')] <= 3 &&
    console.error('[error] ', ...args),
};
