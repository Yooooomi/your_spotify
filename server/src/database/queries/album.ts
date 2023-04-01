import { AlbumModel } from '../Models';

export const getAlbums = (albumsId: string[]) =>
  AlbumModel.find({ id: { $in: albumsId } });
