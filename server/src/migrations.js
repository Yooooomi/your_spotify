const migrate = require('migrate');
const path = require('path');
const { connect, Migration } = require('./database');
const logger = require('./tools/logger');

class MongoDbStore {
  load = async (fn) => {
    await connect();
    const data = await Migration.findOne({});
    if (!data) {
      logger.info('Cannot read migrations from database. If this is the first time you run migrations, then this is normal.');
      return fn(null, {});
    }
    return fn(null, data);
  }

  save = async (set, fn) => {
    const result = await Migration
      .updateOne({}, {
        $set: {
          lastRun: set.lastRun,
        },
        $push: {
          migrations: { $each: set.migrations },
        },
      }, { upsert: true });
    return fn(null, result);
  }
}

migrate.load({
  migrationsDirectory: path.join(__dirname, 'migrations'),
  stateStore: new MongoDbStore(),
}, (err, set) => {
  if (err) {
    logger.error(err);
    process.exit(1);
  }
  set.up((seterr) => {
    if (seterr) {
      logger.error(seterr);
      process.exit(1);
    }
    logger.info('Migrations successfully ran');
    process.exit(0);
  });
});
