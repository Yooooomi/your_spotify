import { deleteInfos, getAllUsers, getPossibleDuplicates } from '../database';
import {
  getAdminUser,
  getAlbumsWithoutArtist,
  getTracksWithoutAlbum,
} from '../database/queries/tools';
import { storeAlbums, storeArtists } from '../spotify/dbTools';
import { longWriteDbLock } from './lock';
import { logger } from './logger';

export const repairDatabase = async () => {
  await longWriteDbLock.lock();
  logger.info('Checking database...');
  const user = await getAdminUser();
  if (!user) {
    logger.warn('No user is admin, cannot auto fix database');
    longWriteDbLock.unlock();
    return;
  }
  const allTracks = await getTracksWithoutAlbum();
  if (allTracks.length > 0) {
    const albumIds = allTracks.map(t => t.album);
    logger.info(`Fixing missing albums (${albumIds.join(',')})`);
    await storeAlbums(user._id.toString(), albumIds);
  }
  const allAlbums = await getAlbumsWithoutArtist();
  if (allAlbums.length > 0) {
    const artistIds = allAlbums.map(t => t.artists).flat(1);
    logger.info(`Fixing missing artists (${artistIds.join(',')})`);
    await storeArtists(user._id.toString(), artistIds);
  }
  if (allTracks.length > 0 || allAlbums.length > 0) {
    logger.info('Database fixed');
  }
  longWriteDbLock.unlock();
};

export const deletePossibleDuplicates = async () => {
  const users = await getAllUsers();
  const allToDelete = new Set<string>();

  // eslint-disable-next-line no-restricted-syntax
  for (const user of users) {
    // eslint-disable-next-line no-await-in-loop
    const duplicates = await getPossibleDuplicates(user._id.toString(), 30);
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
  await deleteInfos([...allToDelete.values()]);
};
