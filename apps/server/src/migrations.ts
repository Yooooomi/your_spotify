import path from "path";
import { load, MigrationSet, Callback as CallbackError } from "migrate";
import { connect } from "./database";
import { MigrationModel } from "./database/Models";
import { logger } from "./tools/logger";
import { Database } from "./tools/database";

type Callback = (err: any, data: any) => void;
export class MongoDbStore {
  load = async (fn: Callback) => {
    await connect();
    const data = await MigrationModel.findOne({});
    if (!data) {
      logger.info(
        "Cannot read migrations from database. If this is the first time you run migrations, then this is normal.",
      );
      return fn(null, {});
    }
    return fn(null, data);
  };

  save = async (set: MigrationSet, fn: CallbackError) => {
    await MigrationModel.updateOne(
      {},
      {
        $set: {
          lastRun: set.lastRun,
        },
        $push: {
          migrations: { $each: set.migrations },
        },
      },
      { upsert: true },
    );
    return fn(null);
  };
}

export function runMigrations() {
  load(
    {
      migrationsDirectory: path.join(__dirname, "migrations"),
      stateStore: new MongoDbStore(),
    },
    async (err: any, set: MigrationSet) => {
      await Database.startup();
      logger.info("Starting migrations");
      if (err) {
        logger.error(`Error ${err}`);
        process.exit(1);
      }
      set.up((seterr: any) => {
        if (seterr) {
          logger.error(`Error ${seterr}`);
          process.exit(1);
        }
        logger.info("Migrations successfully ran");
        process.exit(0);
      });
    },
  );
}

runMigrations();
