import { connect as connectToDb } from 'mongoose';
import { getWithDefault } from '../tools/env';
import { logger } from '../tools/logger';

export * from './queries/stats';
export * from './queries/user';
export * from './queries/global';
export * from './queries/artist';
export * from './queries/track';

export const connect = async () => {
  const DB_PORT = getWithDefault('DB_PORT', 27017);
  const endpoint = `mongodb://mongo:${DB_PORT}/your_spotify`;
  logger.info(`Trying to connect to database at ${endpoint}`);
  const client = await connectToDb(endpoint, {
    connectTimeoutMS: 3000,
  });
  logger.info('Connected to database !');
  return client;
};
