import { connect as connectToDb } from 'mongoose';
import { getWithDefault } from '../tools/env';
import { logger } from '../tools/logger';

export * from './queries/stats';
export * from './queries/user';
export * from './queries/global';
export * from './queries/artist';
export * from './queries/track';

export const connect = async () => {
  const fallbackConnection = 'mongodb://mongo:27017/your_spotify';
  const endpoint = getWithDefault('MONGO_ENDPOINT', fallbackConnection);
  logger.info(`Trying to connect to database at ${endpoint}`);
  const client = await connectToDb(endpoint, {
    connectTimeoutMS: 3000,
  });
  logger.info('Connected to database !');
  return client;
};
