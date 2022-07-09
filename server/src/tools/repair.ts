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
