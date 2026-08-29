import { connect as connectToDb, Mongoose } from "mongoose";

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
  logger.info(`Trying to connect to database at ${endpoint}`);
  
  let client: Mongoose | undefined;
  let lastError: Error | undefined;

  for (let i = 0; i < TRIES; i += 1) {
    try {
      // Primary Attempt: Default options (Omitting family allows native Dual-Stack IPv6/IPv4 resolution)
      client = await connectToDb(endpoint, {
        connectTimeoutMS: 3000,
      });
      break;
    } catch (e: any) {
      lastError = e;
      logger.warn(
        `Dual-stack database connection attempt failed (${i + 1}/${TRIES}): ${e?.message || e}`
      );

      // Secondary Attempt (Fallback): Force Family 4 (IPv4) if default resolution fails
      try {
        logger.info("Retrying database connection using forced IPv4 fallback...");
        client = await connectToDb(endpoint, {
          connectTimeoutMS: 3000,
          family: 4,
        });
        break;
      } catch (fallbackErr: any) {
        lastError = fallbackErr;
        logger.error(
          `IPv4 fallback database connection failed (${i + 1}/${TRIES}): ${fallbackErr?.message || fallbackErr}`
        );
      }

      if (i < TRIES - 1) {
        await wait(WAIT_MS);
      }
    }
  }

  if (!client) {
    throw lastError;
  }

  logger.info("Connected to database !");
  return client;
};
