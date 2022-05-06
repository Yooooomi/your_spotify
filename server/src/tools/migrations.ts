import { logger } from './logger';

export function startMigration(title: string) {
  logger.info(`Running migration: ${title}`);
}
