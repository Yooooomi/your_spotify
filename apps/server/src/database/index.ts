import mongoose from "mongoose";
import { getWithDefault } from "../tools/env";
import { logger } from "../tools/logger";
import { wait } from "../tools/misc";

export * from "./queries/stats";
export * from "./queries/user";
export * from "./queries/global";
export * from "./queries/artist";
export * from "./queries/track";

const TRIES = 10;
const WAIT_MS = 30_000;

export const connect = async () => {
  const fallbackConnection = "mongodb://mongo:27017/your_spotify";
  const endpoint = getWithDefault("MONGO_ENDPOINT", fallbackConnection);
  mongoose.set('allowDiskUse', true);
  logger.info(`Trying to connect to database at ${endpoint}`);
  let client: mongoose.Mongoose | undefined;
  let lastError: Error | undefined;
  for (let i = 0; i < TRIES; i += 1) {
    try {
      client = await mongoose.connect(endpoint, {
        connectTimeoutMS: 3000,
        allowDiskUse: true
      });
    } catch (e) {
      lastError = e;
      logger.error(`Failed to connect to database, try ${i + 1}/${TRIES}`);
      await wait(WAIT_MS);
    }
  }
  if (!client) {
    throw lastError;
  }
  logger.info("Connected to database !");
  return client;
};
