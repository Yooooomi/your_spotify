import { changeSetting } from "../database";
import { UserModel } from "../database/Models";
import { startMigration } from "../tools/migrations";

export async function up() {
  startMigration("add date format to user");

  for await (const user of UserModel.find()) {
    await changeSetting("_id", user._id, {
      dateFormat: "default",
    });
  }
}

export async function down() {}
