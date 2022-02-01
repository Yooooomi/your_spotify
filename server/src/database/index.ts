import { connect as connectToDb } from "mongoose";
import { logger } from "../tools/logger";

export * from "./queries/stats";
export * from "./queries/user";
export * from "./queries/global";
export * from "./queries/artist";
export * from "./queries/track";

export const connect = async () => {
  logger.debug("Trying to connect to database");
  const fallbackConnection = "mongodb://mongo:27017/your_spotify";
  const client = await connectToDb(
    process.env.MONGO_ENDPOINT || fallbackConnection,
    {
      connectTimeoutMS: 3000,
    }
  );
  logger.debug("Connected to database !");
  return client;
};
