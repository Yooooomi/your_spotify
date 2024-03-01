import { Timesplit } from "../../tools/types";
import { InfosModel } from "../Models";
import { User } from "../schemas/user";
import {
  basicMatch,
  getBestInfos,
  getGroupByDateProjection,
  getGroupingByTimeSplit,
  getTrackSumType,
  lightAlbumLookupPipeline,
  lightArtistLookupPipeline,
  lightTrackLookupPipeline,
  sortByTimeSplit,
} from "./statsTools";

export const getMostListenedSongs = async (
  user: User,
  start: Date,
  end: Date,
  timeSplit: Timesplit = Timesplit.hour,
) => {
  const res = await InfosModel.aggregate([
    ...basicMatch(user._id, start, end),
    {
      $project: { ...getGroupByDateProjection(user.settings.timezone), id: 1 },
    },

    {
      $group: {
        _id: { ...getGroupingByTimeSplit(timeSplit), track: "$id" },
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1, "_id.track": 1 } },
    {
      $group: {
        _id: getGroupingByTimeSplit(timeSplit, "_id"),
        tracks: { $push: "$_id.track" },
        counts: { $push: "$count" },
      },
    },
    {
      $project: {
        _id: 1,
        tracks: { $slice: ["$tracks", user.settings.nbElements] },
        counts: { $slice: ["$counts", user.settings.nbElements] },
      },
    },
    { $unwind: { path: "$tracks", includeArrayIndex: "trackIdx" } },
    {
      $lookup: {
        from: "tracks",
        localField: "tracks",
        foreignField: "id",
        as: "tracks",
      },
    },
    { $unwind: "$tracks" },
    {
      $lookup: {
        from: "albums",
        localField: "tracks.album",
        foreignField: "id",
        as: "tracks.album",
      },
    },
    { $unwind: "$tracks.album" },
    {
      $group: {
        _id: getGroupingByTimeSplit(timeSplit, "_id"),
        tracks: { $push: "$tracks" },
        counts: { $push: { $arrayElemAt: ["$counts", "$trackIdx"] } },
      },
    },
    ...sortByTimeSplit(timeSplit, "_id"),
  ]);
  return res;
};

export const getMostListenedArtist = async (
  user: User,
  start: Date,
  end: Date,
  timeSplit = Timesplit.hour,
) => {
  const res = await InfosModel.aggregate([
    ...basicMatch(user._id, start, end),
    {
      $project: {
        ...getGroupByDateProjection(user.settings.timezone),
        primaryArtistId: 1,
        id: 1,
      },
    },
    {
      $group: {
        _id: {
          ...getGroupingByTimeSplit(timeSplit),
          artistId: "$primaryArtistId",
        },
        count: { $sum: getTrackSumType(user, "$durationMs") },
      },
    },
    { $sort: { count: -1, "_id.artistId": 1 } },
    {
      $group: {
        _id: getGroupingByTimeSplit(timeSplit, "_id"),
        artists: { $push: "$_id.artistId" },
        counts: { $push: "$count" },
      },
    },
    {
      $project: {
        _id: 1,
        artists: { $slice: ["$artists", user.settings.nbElements] },
        counts: { $slice: ["$counts", user.settings.nbElements] },
      },
    },
    { $unwind: { path: "$artists", includeArrayIndex: "artIdx" } },
    {
      $lookup: {
        from: "artists",
        localField: "artists",
        foreignField: "id",
        as: "artists",
      },
    },
    { $unwind: "$artists" },
    {
      $group: {
        _id: getGroupingByTimeSplit(timeSplit, "_id"),
        artists: { $push: "$artists" },
        counts: { $push: { $arrayElemAt: ["$counts", "$artIdx"] } },
      },
    },
    ...sortByTimeSplit(timeSplit, "_id"),
  ]);
  return res;
};

export const getSongsPer = async (
  user: User,
  start: Date,
  end: Date,
  timeSplit = Timesplit.day,
) => {
  const res = await InfosModel.aggregate([
    ...basicMatch(user._id, start, end),
    {
      $project: {
        ...getGroupByDateProjection(user.settings.timezone),
        id: 1,
      },
    },
    {
      $group: {
        _id: getGroupingByTimeSplit(timeSplit),
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
    ...sortByTimeSplit(timeSplit, "_id"),
  ]);
  return res;
};

export const getTimePer = async (
  user: User,
  start: Date,
  end: Date,
  timeSplit = Timesplit.day,
) => {
  const res = await InfosModel.aggregate([
    ...basicMatch(user._id, start, end),
    {
      $project: {
        ...getGroupByDateProjection(user.settings.timezone),
        durationMs: 1,
        id: 1,
      },
    },
    {
      $group: {
        _id: getGroupingByTimeSplit(timeSplit),
        count: { $sum: "$durationMs" },
      },
    },
    ...sortByTimeSplit(timeSplit, "_id"),
  ]);
  return res;
};

export const albumDateRatio = async (
  user: User,
  start: Date,
  end: Date,
  timeSplit = Timesplit.day,
) => {
  const res = await InfosModel.aggregate([
    ...basicMatch(user._id, start, end),
    {
      $project: {
        ...getGroupByDateProjection(user.settings.timezone),
        id: 1,
      },
    },
    {
      $lookup: {
        from: "tracks",
        localField: "id",
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
        as: "album",
      },
    },
    { $unwind: "$album" },
    {
      $group: {
        _id: getGroupingByTimeSplit(timeSplit),
        totalYear: {
          $sum: {
            $toInt: {
              $arrayElemAt: [{ $split: ["$album.release_date", "-"] }, 0],
            },
          },
        },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 1,
        totalYear: { $divide: ["$totalYear", "$count"] },
        count: 1,
      },
    },
    ...sortByTimeSplit(timeSplit, "_id"),
  ]);

  return res;
};

export const featRatio = async (
  user: User,
  start: Date,
  end: Date,
  timeSplit: Timesplit,
) => {
  const res = await InfosModel.aggregate([
    ...basicMatch(user._id, start, end),
    {
      $project: {
        ...getGroupByDateProjection(user.settings.timezone),
        id: 1,
      },
    },
    {
      $lookup: {
        from: "tracks",
        localField: "id",
        foreignField: "id",
        as: "track",
      },
    },
    { $unwind: "$track" },
    {
      $group: {
        _id: getGroupingByTimeSplit(timeSplit),
        1: {
          $sum: {
            $cond: {
              if: { $eq: [{ $size: "$track.artists" }, 1] },
              then: 1,
              else: 0,
            },
          },
        },
        2: {
          $sum: {
            $cond: {
              if: { $eq: [{ $size: "$track.artists" }, 2] },
              then: 1,
              else: 0,
            },
          },
        },
        3: {
          $sum: {
            $cond: {
              if: { $eq: [{ $size: "$track.artists" }, 3] },
              then: 1,
              else: 0,
            },
          },
        },
        4: {
          $sum: {
            $cond: {
              if: { $eq: [{ $size: "$track.artists" }, 4] },
              then: 1,
              else: 0,
            },
          },
        },
        5: {
          $sum: {
            $cond: {
              if: { $eq: [{ $size: "$track.artists" }, 5] },
              then: 1,
              else: 0,
            },
          },
        },
        totalPeople: { $sum: { $size: "$track.artists" } },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 1,
        1: 1,
        2: 1,
        3: 1,
        4: 1,
        5: 1,
        count: 1,
        totalPeople: 1,
        average: { $divide: ["$totalPeople", "$count"] },
      },
    },
    ...sortByTimeSplit(timeSplit, "_id"),
  ]);
  return res;
};

export const popularityPer = async (
  user: User,
  start: Date,
  end: Date,
  timeSplit = Timesplit.day,
) => {
  const res = await InfosModel.aggregate([
    ...basicMatch(user._id, start, end),
    {
      $project: {
        ...getGroupByDateProjection(user.settings.timezone),
        id: 1,
      },
    },
    {
      $lookup: {
        from: "tracks",
        localField: "id",
        foreignField: "id",
        as: "track",
      },
    },
    { $unwind: "$track" },
    {
      $group: {
        _id: getGroupingByTimeSplit(timeSplit),
        totalPopularity: { $sum: "$track.popularity" },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 1,
        totalPopularity: { $divide: ["$totalPopularity", "$count"] },
        count: 1,
      },
    },
    ...sortByTimeSplit(timeSplit, "_id"),
  ]);
  return res;
};

export const differentArtistsPer = async (
  user: User,
  start: Date,
  end: Date,
  timeSplit = Timesplit.day,
) => {
  const res = await InfosModel.aggregate([
    ...basicMatch(user._id, start, end),
    {
      $project: {
        ...getGroupByDateProjection(user.settings.timezone),
        primaryArtistId: 1,
        durationMs: 1,
        id: 1,
      },
    },
    {
      $group: {
        _id: {
          ...getGroupingByTimeSplit(timeSplit),
          artistId: `$primaryArtistId`,
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1, "_id.artistId": 1 } },
    {
      $lookup: {
        from: "artists",
        localField: "_id.artistId",
        foreignField: "id",
        as: "artist",
      },
    },
    { $unwind: "$artist" },
    {
      $group: {
        _id: getGroupingByTimeSplit(timeSplit, "_id"),
        artists: { $push: "$artist" },
        differents: { $sum: 1 },
        counts: { $push: "$count" },
      },
    },
    ...sortByTimeSplit(timeSplit, "_id"),
  ]);

  return res;
};

export const getDayRepartition = async (user: User, start: Date, end: Date) => {
  const res = await InfosModel.aggregate([
    ...basicMatch(user._id, start, end),
    {
      $project: {
        ...getGroupByDateProjection(user.settings.timezone),
        durationMs: 1,
        id: 1,
      },
    },
    {
      $group: {
        _id: "$hour",
        count: { $sum: getTrackSumType(user, "$durationMs") },
      },
    },
    { $sort: { _id: 1 } },
  ]);
  return res;
};

export const getBestArtistsPer = async (
  user: User,
  start: Date,
  end: Date,
  timeSplit = Timesplit.day,
) => {
  const res = await InfosModel.aggregate([
    ...basicMatch(user._id, start, end),
    {
      $project: { ...getGroupByDateProjection(user.settings.timezone), id: 1 },
    },
    {
      $lookup: {
        from: "tracks",
        localField: "id",
        foreignField: "id",
        as: "track",
      },
    },
    { $unwind: "$track" },
    {
      $group: {
        _id: {
          ...getGroupingByTimeSplit(timeSplit),
          art: { $arrayElemAt: ["$track.artists", 0] },
        },
        count: { $sum: getTrackSumType(user) },
      },
    },
    { $sort: { count: -1, "_id.art": 1 } },
    {
      $group: {
        _id: getGroupingByTimeSplit(timeSplit, "_id"),
        artists: { $push: "$_id.art" },
        counts: { $push: "$count" },
      },
    },
    {
      $project: {
        _id: 1,
        artists: { $slice: ["$artists", user.settings.nbElements] },
        counts: { $slice: ["$counts", user.settings.nbElements] },
      },
    },
    { $unwind: { path: "$artists", includeArrayIndex: "artIdx" } },
    {
      $lookup: {
        from: "artists",
        localField: "artists",
        foreignField: "id",
        as: "artists",
      },
    },
    { $unwind: "$artists" },
    {
      $group: {
        _id: getGroupingByTimeSplit(timeSplit, "_id"),
        artists: { $push: "$artists" },
        counts: { $push: { $arrayElemAt: ["$counts", "$artIdx"] } },
      },
    },
    ...sortByTimeSplit(timeSplit, "_id"),
  ]);
  return res;
};

export const getBestSongsNbOffseted = (
  user: User,
  start: Date,
  end: Date,
  nb: number,
  offset: number,
) => getBestInfos("id", user, start, end, nb, offset);

export const getBestArtistsNbOffseted = (
  user: User,
  start: Date,
  end: Date,
  nb: number,
  offset: number,
) => getBestInfos("primaryArtistId", user, start, end, nb, offset);

export const getBestAlbumsNbOffseted = (
  user: User,
  start: Date,
  end: Date,
  nb: number,
  offset: number,
) => getBestInfos("albumId", user, start, end, nb, offset);

export const getBestSongsOfHour = (user: User, start: Date, end: Date) => {
  return InfosModel.aggregate([
    ...basicMatch(user._id, start, end),
    {
      $addFields: {
        hour: getGroupByDateProjection(user.settings.timezone).hour,
      },
    },
    { $group: { _id: "$hour", songs: { $push: "$id" }, total: { $sum: 1 } } },
    { $unwind: "$songs" },
    {
      $group: {
        _id: { _id: "$_id", song: "$songs" },
        count: { $sum: 1 },
        total: { $first: "$total" },
      },
    },
    { $sort: { count: -1 } },
    {
      $group: {
        _id: "$_id._id",
        songs: { $push: { song: "$_id.song", count: "$count" } },
        total: { $first: "$total" },
      },
    },
    { $addFields: { songs: { $slice: ["$songs", 20] } } },
    { $unwind: "$songs" },
    { $lookup: lightTrackLookupPipeline("songs.song") },
    { $unwind: "$track" },
    { $lookup: lightArtistLookupPipeline("track.artists", true) },
    { $unwind: "$artist" },
    {
      $group: {
        _id: "$_id",
        tracks: {
          $push: { track: "$track", artist: "$artist", count: "$songs.count" },
        },
        total: { $first: "$total" },
      },
    },
    { $sort: { _id: 1 } },
  ]);
};

export const getBestAlbumsOfHour = (user: User, start: Date, end: Date) => {
  return InfosModel.aggregate([
    ...basicMatch(user._id, start, end),
    {
      $addFields: {
        hour: getGroupByDateProjection(user.settings.timezone).hour,
      },
    },
    { $group: { _id: "$hour", songs: { $push: "$id" }, total: { $sum: 1 } } },
    { $unwind: "$songs" },
    { $lookup: lightTrackLookupPipeline("songs") },
    { $unwind: "$track" },
    {
      $group: {
        _id: { _id: "$_id", album: "$track.album" },
        count: { $sum: 1 },

        total: { $first: "$total" },
      },
    },
    { $sort: { count: -1 } },
    {
      $group: {
        _id: "$_id._id",
        albums: { $push: { album: "$_id.album", count: "$count" } },

        total: { $first: "$total" },
      },
    },
    { $addFields: { albums: { $slice: ["$albums", 20] } } },
    { $unwind: "$albums" },
    { $lookup: lightAlbumLookupPipeline("albums.album") },
    { $unwind: "$album" },
    { $lookup: lightArtistLookupPipeline("album.artists", true) },
    { $unwind: "$artist" },
    {
      $group: {
        _id: "$_id",
        albums: {
          $push: { album: "$album", artist: "$artist", count: "$albums.count" },
        },
        total: { $first: "$total" },
      },
    },
    { $sort: { _id: 1 } },
  ]);
};

export const getBestArtistsOfHour = (user: User, start: Date, end: Date) => {
  return InfosModel.aggregate([
    ...basicMatch(user._id, start, end),
    {
      $addFields: {
        hour: getGroupByDateProjection(user.settings.timezone).hour,
      },
    },
    { $group: { _id: "$hour", songs: { $push: "$id" }, total: { $sum: 1 } } },
    { $unwind: "$songs" },
    { $lookup: lightTrackLookupPipeline("songs") },
    { $unwind: "$track" },
    {
      $group: {
        _id: { _id: "$_id", artist: { $first: "$track.artists" } },
        count: { $sum: 1 },

        total: { $first: "$total" },
      },
    },
    { $sort: { count: -1 } },
    {
      $group: {
        _id: "$_id._id",
        artists: { $push: { artist: "$_id.artist", count: "$count" } },
        total: { $first: "$total" },
      },
    },
    { $addFields: { artists: { $slice: ["$artists", 20] } } },
    { $unwind: "$artists" },
    { $lookup: lightArtistLookupPipeline("artists.artist", false) },
    { $unwind: "$artist" },
    {
      $group: {
        _id: "$_id",
        artists: { $push: { artist: "$artist", count: "$artists.count" } },
        total: { $first: "$total" },
      },
    },
    { $sort: { _id: 1 } },
  ]);
};

export const getLongestListeningSession = (
  userId: string,
  start: Date,
  end: Date,
) => {
  const sessionBreakThreshold = 10 * 60 * 1000;
  const subtract = {
    $cond: [
      "$$value.last",
      {
        $subtract: [
          "$$this.played_at",
          {
            $add: ["$$value.last.played_at", "$$value.last.track.duration_ms"],
          },
        ],
      },
      sessionBreakThreshold + 1,
    ],
  };

  const item = { subtract, info: "$$this" };

  return InfosModel.aggregate([
    ...basicMatch(userId, start, end),
    { $sort: { played_at: 1 } },
    { $lookup: lightTrackLookupPipeline() },
    { $unwind: "$track" },
    {
      $group: {
        _id: "$owner",
        infos: { $push: "$$ROOT" },
      },
    },
    {
      $addFields: {
        distanceToLast: {
          $reduce: {
            input: "$infos",
            initialValue: { distance: [], current: [] },
            in: {
              distance: {
                $concatArrays: [
                  "$$value.distance",
                  {
                    $cond: {
                      if: {
                        $gt: [subtract, sessionBreakThreshold],
                      },
                      then: ["$$value.current"],
                      else: [],
                    },
                  },
                ],
              },
              current: {
                $cond: {
                  if: {
                    $gt: [subtract, sessionBreakThreshold],
                  },
                  then: [item],
                  else: {
                    $concatArrays: ["$$value.current", [item]],
                  },
                },
              },
              last: "$$this",
            },
          },
        },
      },
    },
    { $unset: ["infos", "distanceToLast.last"] },
    {
      $addFields: {
        "distanceToLast.distance": {
          $concatArrays: [
            "$distanceToLast.distance",
            ["$distanceToLast.current"],
          ],
        },
      },
    },
    { $unset: "distanceToLast.current" },
    {
      $unwind: {
        path: "$distanceToLast.distance",
      },
    },
    {
      $addFields: {
        sessionLength: {
          $subtract: [
            { $last: "$distanceToLast.distance.info.played_at" },
            { $first: "$distanceToLast.distance.info.played_at" },
          ],
        },
      },
    },
    { $sort: { sessionLength: -1 } },
    { $limit: 5 },
  ]);
};
