import { UserModel } from "../database/Models";
import { startMigration } from "../tools/migrations";

export async function up() {
  startMigration("add syncLikedSongs to user");

  for await (const user of UserModel.find()) {
    if (user.syncLikedSongs !== true) {
      await UserModel.updateOne(
        { _id: user._id },
        { $set: { syncLikedSongs: false } }
      );
    }
  }
}

export async function down() {}
