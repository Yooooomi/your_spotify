import { InfosModel, TrackModel } from "../Models";
import { User } from "../schemas/user";
import { Timesplit } from "../../tools/types";
import { getGroupByDateProjection, getGroupingByTimeSplit } from "./statsTools";

export const getTracks = (tracksId: string[]) =>
  TrackModel.find({ id: { $in: tracksId } });

export const searchTrack = (str: string) =>
  TrackModel.find({ name: { $regex: new RegExp(str, "i") } }).populate(
    "full_album",
  );

export const getRankOfTrack = async (user: User, trackId: string) => {
  const res = await InfosModel.aggregate([
    { $match: { owner: user._id } },
    {
      $lookup: {
        from: "tracks",
        localField: "id",
        foreignField: "id",
        as: "track",
      },
    },
    { $unwind: "$track" },
    { $group: { _id: "$id", count: { $sum: 1 } } },
    { $sort: { count: -1, _id: 1 } },
    { $group: { _id: 1, array: { $push: { id: "$_id", count: "$count" } } } },
    {
      $project: {
        index: { $indexOfArray: ["$array.id", trackId] },
        array: 1,
      },
    },
    {
      $project: {
        index: 1,
        isMax: {
          $cond: { if: { $eq: ["$index", 0] }, then: true, else: false },
        },
        isMin: {
          $cond: {
            if: { $eq: ["$index", { $subtract: [{ $size: "$array" }, 1] }] },
            then: true,
            else: false,
          },
        },
        results: {
          $slice: ["$array", { $max: [{ $subtract: ["$index", 1] }, 0] }, 3],
        },
      },
    },
  ]);
  return res[0];
};

export const getTrackListenedCount = (user: User, trackId: string) =>
  InfosModel.where({ owner: user._id, id: trackId }).countDocuments();

export const getTrackFirstAndLastListened = async (
  user: User,
  trackId: string,
) => {
  const res = await InfosModel.aggregate([
    { $match: { owner: user._id, id: trackId } },
    { $sort: { played_at: 1 } },
    {
      $group: {
        _id: null,
        first: { $first: "$$ROOT" },
        last: { $last: "$$ROOT" },
      },
    },
  ]);
  return res[0];
};

export const bestPeriodOfTrack = async (user: User, trackId: string) => {
  const res = await InfosModel.aggregate([
    { $match: { owner: user._id, id: trackId } },
    {
      $project: {
        ...getGroupByDateProjection(user.settings.timezone),
        id: 1,
      },
    },
    {
      $group: { _id: null, items: { $push: "$$CURRENT" }, total: { $sum: 1 } },
    },
    { $unwind: "$items" },
    {
      $group: {
        _id: getGroupingByTimeSplit(Timesplit.month, "items"),
        count: { $sum: 1 },
        total: { $last: "$total" },
      },
    },
    { $sort: { count: -1 } },
    { $limit: 2 },
  ]);
  return res;
};

export const getTrackRecentHistory = async (user: User, trackId: string) =>
  InfosModel.find()
    .where({ owner: user._id, id: trackId })
    .limit(10)
    .sort({ played_at: -1 });

export const getTrackBySpotifyId = (id: string) => TrackModel.findOne({ id });

export const checkBlacklistConsistency = () =>
  InfosModel.updateMany(
    {
      blacklistedBy: { $size: 0 },
    },
    {
      $unset: { blacklistedBy: 1 },
    },
  );

export const unblacklistByArtist = async (userId: string, artistId: string) => {
  const tracks = await TrackModel.find({ "artists.0": artistId });
  const trackIds = tracks.map(t => t.id);
  await InfosModel.updateMany(
    {
      owner: userId,
      id: { $in: trackIds },
      blacklistedBy: { $elemMatch: { $eq: "artist" } },
    },
    { $pull: { blacklistedBy: "artist" } },
  );
  await InfosModel.updateMany(
    {
      owner: userId,
      blacklistedBy: { $size: 0 },
    },
    {
      $unset: { blacklistedBy: 1 },
    },
  );
};

export const blacklistByArtist = async (userId: string, artistId: string) => {
  const tracks = await TrackModel.find({ "artists.0": artistId });
  const trackIds = tracks.map(t => t.id);
  return InfosModel.updateMany(
    {
      owner: userId,
      id: { $in: trackIds },
    },
    { $addToSet: { blacklistedBy: "artist" } },
  );
};
