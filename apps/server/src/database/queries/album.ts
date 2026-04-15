import { AlbumModel, InfosModel } from "../Models";
import { User } from "../schemas/user";

export const getAlbums = (albumsId: string[]) =>
  AlbumModel.find({ id: { $in: albumsId } });

export const searchAlbum = (str: string) =>
  AlbumModel.find({ name: { $regex: new RegExp(str, "i") } })
    .populate("full_artists");

export const getFirstAndLastListenedAlbum = async (
  user: User,
  albumId: string,
) => {
  const res = await InfosModel.aggregate([
    { $match: { owner: user._id, albumId: albumId } },
    { $sort: { played_at: 1 } },
    {
      $group: {
        _id: null,
        first: { $first: "$$ROOT" },
        last: { $last: "$$ROOT" },
      },
    },
    ...["first", "last"]
      .map(e => [
        {
          $lookup: {
            from: "tracks",
            localField: `${e}.id`,
            foreignField: "id",
            as: `${e}.track`,
          },
        },
        { $unwind: `$${e}.track` },
      ])
      .flat(1),
  ]);
  return res[0];
};

export const getAlbumSongs = async (user: User, albumId: string) => {
  const res = await InfosModel.aggregate([
    { $match: { owner: user._id, albumId: albumId } },
    { $group: { _id: "$id", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    {
      $lookup: {
        from: "tracks",
        localField: "_id",
        foreignField: "id",
        as: "track",
      },
    },
    { $unwind: "$track" },
  ]);
  return res;
};
