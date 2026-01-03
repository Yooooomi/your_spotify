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

import { up as add_global_preferences } from "./migrations/1618162835253-add_global_preferences"
import { up as add_nb_elements } from "./migrations/1620176626899-add_nb_elements"
import { up as add_best_metric_type } from "./migrations/1620235555105-add_best_metric_type"
import { up as auth } from "./migrations/1645792294977-spotify_auth"
import { up as admins } from "./migrations/1645792294980-admins"
import { up as darkmode } from "./migrations/1645792294981-darkmode"
import { up as fix_first_listened_at } from "./migrations/1645792294982-fix_first_listened_at"
import { up as create_private_data } from "./migrations/1708973485300-create_private_data"
import { up as add_metadata_to_infos } from "./migrations/1708973485301-add_metadata_to_infos"
import { up as add_language_to_user } from "./migrations/1708973485302-add_language_to_user"

function noop() { }

export function runMigrations() {
  load(
    {
      migrations: {
        "1618162835253-add_global_preferences.js": { up: add_global_preferences, down: noop },
        "1620176626899-add_nb_elements.js": { up: add_nb_elements, down: noop },
        "1620235555105-add_best_metric_type.js": { up: add_best_metric_type, down: noop },
        "1645792294977-spotify-auth.js": { up: auth, down: noop },
        "1645792294980-admins.js": { up: admins, down: noop },
        "1645792294981-darkmode.js": { up: darkmode, down: noop },
        "1645792294982-fix_first_listened_at.js": { up: fix_first_listened_at, down: noop },
        "1708973485300-create_private_data.js": { up: create_private_data, down: noop },
        "1708973485301-add_metadata_to_infos.js": { up: add_metadata_to_infos, down: noop },
        "1708973485302-add_language_to_user.js": { up: add_language_to_user, down: noop },
      },
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
