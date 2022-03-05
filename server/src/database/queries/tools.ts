import { AlbumModel, TrackModel, UserModel } from '../Models';
import { Album } from '../schemas/album';
import { Track } from '../schemas/track';

export const getAdminUser = () => UserModel.findOne({ admin: true });

export const getTracksWithoutAlbum = () =>
  TrackModel.aggregate<Track>([
    {
      $lookup: {
        from: 'albums',
        as: 'full_album',
        localField: 'album',
        foreignField: 'id',
      },
    },
    { $unwind: { path: '$full_album', preserveNullAndEmptyArrays: true } },
    { $match: { full_album: null } },
  ]);

export const getAlbumsWithoutArtist = () =>
  AlbumModel.aggregate<Album>([
    {
      $lookup: {
        from: 'artists',
        as: 'full_artist',
        localField: 'album',
        foreignField: 'id',
      },
    },
    { $unwind: '$full_artist' },
    { $match: { full_artist: null } },
  ]);
