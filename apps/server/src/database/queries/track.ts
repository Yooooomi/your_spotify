import { InfosModel, TrackModel } from "../Models";
import { User } from "../schemas/user";
import { Timesplit } from "../../tools/types";
import { getGroupByDateProjection, getGroupingByTimeSplit } from "./statsTools";
import { getTracks as fetchTracks, storeTrackAlbumArtist } from "../../spotify/dbTools";

export const getTracks = async (userID: string, tracksId: string[]) => {
  const tracks = await TrackModel.find({ id: { $in: tracksId } });

  const validFetchedTracks = tracks.filter(track => track.name && track.name.trim() !== '');
  const foundTrackIds = validFetchedTracks.map(track => track.id);
  const missingTrackIds = tracksId.filter(id => !foundTrackIds.includes(id));

  if (missingTrackIds.length > 0) {
    const fetchedTracks = await fetchTracks(userID, missingTrackIds);
    await storeTrackAlbumArtist({ tracks: fetchedTracks });

    return [...tracks, ...fetchedTracks];
  }

  return tracks;
};

export const searchTrack = (str: string) =>
  TrackModel.find({ name: { $regex: new RegExp(str, "i") } }).populate(
    "full_album",
  );

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
