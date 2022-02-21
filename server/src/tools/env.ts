import { z } from 'zod';
import { logger } from './logger';
import { toNumber } from './zod';

const validators = {
  MAX_IMPORT_CACHE_SIZE: z.preprocess(toNumber, z.number().optional()),
  CORS: z.string().optional(),
  SPOTIFY_PUBLIC: z.string(),
  SPOTIFY_SECRET: z.string(),
  APP_PORT: z.preprocess(toNumber, z.number().optional()),
  DB_PORT: z.preprocess(toNumber, z.number().optional()),
  TIMEZONE: z.string().optional(),
} as const;

const env: Record<string, any> = {};

type EnvVariable = keyof typeof validators;

export function getWithDefault<E extends EnvVariable>(
  variable: E,
  defaultValue: NonNullable<z.infer<typeof validators[E]>>,
): NonNullable<z.infer<typeof validators[E]>> {
  return env[variable] ?? defaultValue;
}

export function get<E extends EnvVariable>(variable: E): z.infer<typeof validators[E]> {
  return env[variable];
}

Object.entries(validators).forEach(([key, value]) => {
  const v = process.env[key];
  try {
    const output = value.parse(v);
    env[key] = output;
  } catch (e) {
    logger.error(`${key} env variable is missing`);
    if (e instanceof z.ZodError) {
      e.issues.forEach((issue) => {
        logger.error(`-> ${issue.message}`);
      });
    }
  }
});
