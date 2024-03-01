import { Timesplit } from "../../tools/types";
import { ArtistModel, InfosModel } from "../Models";
import { User } from "../schemas/user";
import { getGroupByDateProjection, getGroupingByTimeSplit } from "./statsTools";

export const getArtists = (artistIds: string[]) =>
  ArtistModel.find({ id: { $in: artistIds } });

export const searchArtist = (str: string) =>
  ArtistModel.find({ name: { $regex: new RegExp(str, "i") } });

export const getArtistInfos = (artistId: string) => [
  {
    $lookup: {
      from: "tracks",
      let: { targetId: "$id" },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [
                { $eq: ["$id", "$$targetId"] },
                { $eq: [{ $first: "$artists" }, artistId] },
              ],
            },
          },
        },
        { $project: { trackId: "$id", artistId: { $first: "$artists" } } },
      ],
      as: "artistInfos",
    },
  },
  { $match: { "artistInfos.artistId": { $exists: true } } },
  { $unwind: "$artistInfos" },
];

export const getFirstAndLastListened = async (user: User, artistId: string) => {
  // Non sense to compute blacklist here
  const res = await InfosModel.aggregate([
    { $match: { owner: user._id, primaryArtistId: artistId } },
    ...getArtistInfos(artistId),
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
            localField: `${e}.artistInfos.trackId`,
            foreignField: "id",
            as: `${e}.track`,
          },
        },
        { $unwind: `$${e}.track` },
        {
          $lookup: {
            from: "albums",
            localField: `${e}.track.album`,
            foreignField: "id",
            as: `${e}.track.album`,
          },
        },
        { $unwind: `$${e}.track.album` },
      ])
      .flat(1),
  ]);
  return res[0];
};

export const getMostListenedSongOfArtist = async (
  user: User,
  artistId: string,
) => {
  const res = await InfosModel.aggregate([
    // Non sense to compute blacklist here
    { $match: { owner: user._id, primaryArtistId: artistId } },
    ...getArtistInfos(artistId),
    { $group: { _id: "$id", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: "tracks",
        localField: "_id",
        foreignField: "id",
        as: "track",
      },
    },
    { $unwind: "$track" },
    {
      $lookup: {
        from: "albums",
        localField: "track.album",
        foreignField: "id",
        as: "track.album",
      },
    },
    { $unwind: "$track.album" },
  ]);
  return res;
};

export const bestPeriodOfArtist = async (user: User, artistId: string) => {
  // Non sense to compute blacklist here
  const res = await InfosModel.aggregate([
    { $match: { owner: user._id, primaryArtistId: artistId } },
    ...getArtistInfos(artistId),
    {
      $project: {
        ...getGroupByDateProjection(user.settings.timezone),
        artistInfos: 1,
      },
    },
    {
      $group: { _id: null, items: { $push: "$$CURRENT" }, total: { $sum: 1 } },
    },
    { $unwind: "$items" },
    {
      $group: {
        _id: getGroupingByTimeSplit(Timesplit.month, "items"),
        artist: { $last: "$items" },
        count: { $sum: 1 },
        total: { $last: "$total" },
      },
    },
    { $sort: { count: -1 } },
    { $limit: 2 },
  ]);
  return res;
};

export const getTotalListeningOfArtist = async (
  user: User,
  artistId: string,
) => {
  // Non sense to compute blacklist here
  const res = await InfosModel.aggregate([
    { $match: { owner: user._id, primaryArtistId: artistId } },
    ...getArtistInfos(artistId),
    {
      $group: {
        _id: 1,
        count: { $sum: 1 },
        differents: { $addToSet: "$id" },
      },
    },
    { $unwind: "$differents" },
    {
      $group: {
        _id: "$_id",
        count: { $first: "$count" },
        differents: { $sum: 1 },
      },
    },
  ]);
  return res[0];
};

export const getMostListenedAlbumOfArtist = async (
  user: User,
  artistId: string,
) => {
  const res = await InfosModel.aggregate([
    { $match: { owner: user._id, primaryArtistId: artistId } },
    {
      $lookup: {
        from: "tracks",
        localField: "id",
        foreignField: "id",
        as: "track",
      },
    },
    {
      $group: {
        _id: "$track.album",
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
    {
      $lookup: {
        from: "albums",
        localField: "_id",
        foreignField: "id",
        as: "album",
      },
    },
    { $unwind: "$album" },
    { $limit: 10 },
  ]);
  return res;
};

export const getDayRepartitionOfArtist = (user: User, artistId: string) =>
  // Non sense to compute blacklist here
  InfosModel.aggregate([
    { $match: { owner: user._id, primaryArtistId: artistId } },
    { $addFields: getGroupByDateProjection(user.settings.timezone) },
    ...getArtistInfos(artistId),
    {
      $lookup: {
        from: "tracks",
        localField: "artistInfos.trackId",
        foreignField: "id",
        as: "track",
      },
    },
    { $unwind: "$track" },
    {
      $group: {
        _id: "$hour",
        count: { $sum: 1 },
        duration: { $sum: "$track.duration_ms" },
      },
    },
    { $sort: { _id: 1 } },
  ]);
