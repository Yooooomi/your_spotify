import { AlbumModel, InfosModel, TrackModel, UserModel } from "../Models";
import { Album } from "../schemas/album";
import { Infos } from "../schemas/info";
import { Track } from "../schemas/track";

export const getAdminUser = () => UserModel.findOne({ admin: true });

export const getInfosWithoutTracks = () =>
  InfosModel.aggregate<Infos>([
    {
      $lookup: {
        from: "tracks",
        as: "full_track",
        localField: "id",
        foreignField: "id",
      },
    },
    { $unwind: { path: "$full_track", preserveNullAndEmptyArrays: true } },
    { $match: { full_track: null } },
  ]);

export const getTracksWithoutAlbum = () =>
  TrackModel.aggregate<Track>([
    {
      $lookup: {
        from: "albums",
        as: "full_album",
        localField: "album",
        foreignField: "id",
      },
    },
    { $unwind: { path: "$full_album", preserveNullAndEmptyArrays: true } },
    { $match: { full_album: null } },
  ]);

export const getAlbumsWithoutArtist = () =>
    AlbumModel.aggregate<Album>([
    { $unwind: '$artists' },
    {
      $lookup: {
        from: 'artists',
        localField: 'artists',
        foreignField: 'id',
        as: 'artistDetails'
      }
    },
    { $match: { artistDetails: { $eq: [] } } },
    {
      $group: {
        _id: '$id',
        album: { $first: '$$ROOT' }
      }
    },
    { $replaceRoot: { newRoot: '$album' } }
]);
