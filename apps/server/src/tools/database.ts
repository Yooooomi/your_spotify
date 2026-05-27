import {
  getAllUsers,
  getPossibleDuplicates,
  deleteInfos,
  getUserInfoCount,
} from "../database";
import {
  getCompatibilityVersion,
  getMongoInfos,
  setFeatureCompatibilityVersion,
} from "../database/queries/meta";
import {
  getAdminUser,
  getTracksWithoutAlbum,
  getAlbumsWithoutArtist,
  getInfosWithoutTracks,
} from "../database/queries/tools";
import {
  getAlbums,
  getArtists,
  getTracks,
  storeTrackAlbumArtist,
} from "../spotify/dbTools";
import { getWithDefault } from "./env";
import { longWriteDbLock } from "./lock";
import { logger } from "./logger";
import { uniq } from "./misc";
import { compact } from "./utils";

export class Database {
  static async detectUpgrade() {
    if (getWithDefault("MONGO_NO_ADMIN_RIGHTS", false)) {
      return;
    }
    const infos = await getMongoInfos();
    const [major, minor] = infos.versionArray;
    const [compatibilityMajor, compatibilityMinor] = (
      await getCompatibilityVersion()
    ).featureCompatibilityVersion.version.split(".");
    if (
      compatibilityMajor === undefined ||
      compatibilityMinor === undefined ||
      major === undefined ||
      minor === undefined
    ) {
      logger.warn("Could not get mongo version");
      return;
    }
    if (+compatibilityMajor > major) {
      throw new Error("Cannot downgrade the database");
    }
    if (major === +compatibilityMajor && minor === +compatibilityMinor) {
      return;
    }
    logger.info(`Setting feature compatibility version to ${major}.${minor}`);
    await setFeatureCompatibilityVersion(`${major}.${minor ?? 0}`, major);
  }

  static async fixMissingTrackData() {
    await longWriteDbLock.lock();
    logger.info("Checking database for missing track data...");
    const user = await getAdminUser();
    if (!user) {
      logger.warn("No user is admin, cannot auto fix database");
      longWriteDbLock.unlock();
      return;
    }
    const allInfos = await getInfosWithoutTracks();
    if (allInfos.length > 0) {
      const trackIds = uniq(allInfos.map(e => e.id));
      logger.info(`Fixing missing tracks (${trackIds.join(",")})`);
      const tracks = await getTracks(user._id.toString(), trackIds);
      await storeTrackAlbumArtist({ tracks });
    }
    const allTracks = await getTracksWithoutAlbum();
    if (allTracks.length > 0) {
      const albumIds = uniq(allTracks.map(t => t.album));
      logger.info(
        `Fixing missing albums for tracks ${allTracks.map(track => track.id).join(",")} (${albumIds.join(",")})`,
      );
      const albums = await getAlbums(user._id.toString(), albumIds);
      await storeTrackAlbumArtist({ albums });
    }
    const allAlbums = await getAlbumsWithoutArtist();
    if (allAlbums.length > 0) {
      const artistIds = uniq(compact(allAlbums.map(t => t.artists[t.index])));
      logger.info(
        `Fixing missing artists for albums ${allAlbums.map(track => track.id).join(",")} (${artistIds.join(",")})`,
      );
      const artists = await getArtists(user._id.toString(), artistIds);
      await storeTrackAlbumArtist({ artists });
    }
    if (allInfos.length > 0 || allTracks.length > 0 || allAlbums.length > 0) {
      const total = allInfos.length + allTracks.length + allAlbums.length;
      logger.info(`Database fixed ${total} missing entries`);
    }
    longWriteDbLock.unlock();
  }

  static async deletePossibleDuplicates() {
    const users = await getAllUsers(false);
    const allToDelete = new Set<string>();

    const duplicateBatch = 50_000;


    for (const user of users) {

      const infoCountForUser = await getUserInfoCount(user._id.toString());
      for (let i = 0; i < infoCountForUser; i += duplicateBatch) {

        const duplicates = await getPossibleDuplicates(
          user._id.toString(),
          30,
          duplicateBatch,
          i,
        );
        const nbDuplicates = duplicates.reduce((acc, curr) => {
          curr.duplicates.forEach((duplicate: any) => {
            allToDelete.add(duplicate[1]._id.toString());
          });
          return acc + curr.duplicates.length;
        }, 0);
        if (nbDuplicates > 0) {
          console.log(
            `Removing ${nbDuplicates} duplicates for user ${user.username}`,
          );
        }
      }
    }
    await deleteInfos([...allToDelete.values()]);
  }

  static async startup() {
    await Database.detectUpgrade();
    await Database.fixMissingTrackData();
    await Database.deletePossibleDuplicates();
  }
}
