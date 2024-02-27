import { getTracks } from "../database";
import { InfosModel, UserModel } from "../database/Models";
import { Database } from "../tools/database";
import { startMigration } from "../tools/migrations";

export async function up() {
  startMigration("add metadata to infos");

  await Database.fixMissingTrackData();

  for await (const user of UserModel.find()) {
    for await (const info of InfosModel.find({ owner: user._id })) {
      const [track] = await getTracks([info.id]);
      if (!track) {
        continue;
      }
      const [primaryArtistId] = track.artists;
      if (!primaryArtistId) {
        continue;
      }
      info.primaryArtistId = primaryArtistId;
      info.artistIds = track.artists;
      info.albumId = track.album;

      info.durationMs = track.duration_ms;
      await info.save();
    }
  }
}

export async function down() {}
