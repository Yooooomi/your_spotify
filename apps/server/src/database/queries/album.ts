import { storeTrackAlbumArtist } from "../../spotify/dbTools";
import { AlbumModel, InfosModel } from "../Models";
import { User } from "../schemas/user";
import { getAlbums as fetchAlbums } from "../../spotify/dbTools";

export const getAlbums = async (userID: string, albumIds: string[]) => {
  const albums = await AlbumModel.find({ id: { $in: albumIds } });

  const validFetchedAlbums = albums.filter(album => album.name && album.name.trim() !== '');
  const foundAlbumIds = validFetchedAlbums.map(album => album.id);
  const missingAlbumIds = albumIds.filter(id => !foundAlbumIds.includes(id));

  if (missingAlbumIds.length > 0) {
    const fetchedAlbums = await fetchAlbums(userID, missingAlbumIds);
    await storeTrackAlbumArtist({ albums: fetchedAlbums });

    return [...albums, ...fetchedAlbums];
  }

  return albums;
};

export const searchAlbum = (str: string) =>
  AlbumModel.find({ name: { $regex: new RegExp(str, "i") } });

export const getAlbumInfos = (albumId: string) => [
  {
    $lookup: {
      from: "tracks",
      let: { targetId: "$id" },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [
                { $eq: ["$album", albumId] },
                { $eq: ["$id", "$$targetId"] },
              ],
            },
          },
        },
        { $project: { trackId: "$id", albumId: "$album" } },
      ],
      as: "albumInfos",
    },
  },
  { $match: { "albumInfos.albumId": { $exists: true } } },
  { $unwind: "$albumInfos" },
];

export const getFirstAndLastListenedAlbum = async (
  user: User,
  albumId: string,
) => {
  const res = await InfosModel.aggregate([
    { $match: { owner: user._id, albumId: albumId } },
    ...getAlbumInfos(albumId),
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
            localField: `${e}.albumInfos.trackId`,
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
    ...getAlbumInfos(albumId),
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
