import { createPrivateData } from "../database/queries/privateData";
import { startMigration } from "../tools/migrations";

export async function up() {
  startMigration("create private data");

  await createPrivateData();
}

export async function down() {}
