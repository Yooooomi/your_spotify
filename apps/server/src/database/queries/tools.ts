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
    {
      $lookup: {
        from: "artists",
        as: "full_artists",
        localField: "album",
        foreignField: "id",
      },
    },
    { $unwind: "$full_artists" },
    { $match: { full_artists: null } },
  ]);
