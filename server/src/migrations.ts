/* eslint-disable class-methods-use-this */
// @ts-ignore
import { load, CallbackError, MigrationSet } from 'migrate';
import path from 'path';
import { connect } from './database';
import { MigrationModel } from './database/Models';
import { logger } from './tools/logger';

type Callback = (err: any, data: any) => void;
export class MongoDbStore {
  load = async (fn: Callback) => {
    await connect();
    const data = await MigrationModel.findOne({});
    if (!data) {
      logger.info(
        'Cannot read migrations from database. If this is the first time you run migrations, then this is normal.',
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

load(
  {
    migrationsDirectory: path.join(__dirname, 'migrations'),
    stateStore: new MongoDbStore(),
  },
  (err: any, set: MigrationSet) => {
    logger.info('Starting migrations');
    if (err) {
      logger.error(`Error ${err}`);
      process.exit(1);
    }
    set.up((seterr: any) => {
      if (seterr) {
        logger.error(`Error ${seterr}`);
        process.exit(1);
      }
      logger.info('Migrations successfully ran');
      process.exit(0);
    });
  },
);
