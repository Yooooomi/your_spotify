import { AlbumModel } from '../Models';

export const getAlbums = async (albumsId: string[]) =>
  await AlbumModel.find({ id: { $in: albumsId } });
