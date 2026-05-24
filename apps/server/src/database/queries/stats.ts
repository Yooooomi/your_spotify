import { Timesplit } from "../../tools/types";
import { InfosModel } from "../Models";
import { User } from "../schemas/user";
import {
  basicMatch,
  getGroupByDateProjection,
  getGroupingByTimeSplit,
  getTrackSortType,
  getTrackSumType,
  lightAlbumLookupPipeline,
  lightArtistLookupPipeline,
  lightTrackLookupPipeline,
  sortByTimeSplit,
} from "./statsTools";

export type ItemType = {
  field: string;
  collection: string;
};

export const ItemType = {
  track: {
    field: "$id",
    collection: "tracks",
  },
  album: {
    field: "$albumId",
    collection: "albums",
  },
  artist: {
    field: "$primaryArtistId",
    collection: "artists",
  },
} as const satisfies Record<string, ItemType>;

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
        durationMs: 1,
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
  // infos already carries `albumId`, so the per-play `tracks` lookup is
  // unnecessary. Group by (timeBucket, albumId) first to collapse repeat
  // plays into a single row, then look the album up once per unique row.
  const res = await InfosModel.aggregate([
    ...basicMatch(user._id, start, end),
    {
      $project: {
        ...getGroupByDateProjection(user.settings.timezone),
        albumId: 1,
      },
    },
    {
      $group: {
        _id: {
          ...getGroupingByTimeSplit(timeSplit),
          albumId: "$albumId",
        },
        plays: { $sum: 1 },
      },
    },
    {
      $lookup: {
        from: "albums",
        localField: "_id.albumId",
        foreignField: "id",
        as: "album",
      },
    },
    { $unwind: "$album" },
    {
      $group: {
        _id: getGroupingByTimeSplit(timeSplit, "_id"),
        totalYear: {
          $sum: {
            $multiply: [
              "$plays",
              {
                $toInt: {
                  $arrayElemAt: [{ $split: ["$album.release_date", "-"] }, 0],
                },
              },
            ],
          },
        },
        count: { $sum: "$plays" },
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
  // infos already carries `artistIds`, so the per-play `tracks` lookup is
  // unnecessary — compute the artist count from the denormalized field.
  const res = await InfosModel.aggregate([
    ...basicMatch(user._id, start, end),
    {
      $project: {
        ...getGroupByDateProjection(user.settings.timezone),
        artistsSize: { $size: { $ifNull: ["$artistIds", []] } },
      },
    },
    {
      $group: {
        _id: getGroupingByTimeSplit(timeSplit),
        1: {
          $sum: {
            $cond: { if: { $eq: ["$artistsSize", 1] }, then: 1, else: 0 },
          },
        },
        2: {
          $sum: {
            $cond: { if: { $eq: ["$artistsSize", 2] }, then: 1, else: 0 },
          },
        },
        3: {
          $sum: {
            $cond: { if: { $eq: ["$artistsSize", 3] }, then: 1, else: 0 },
          },
        },
        4: {
          $sum: {
            $cond: { if: { $eq: ["$artistsSize", 4] }, then: 1, else: 0 },
          },
        },
        5: {
          $sum: {
            $cond: { if: { $eq: ["$artistsSize", 5] }, then: 1, else: 0 },
          },
        },
        totalPeople: { $sum: "$artistsSize" },
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
  // infos already carries `primaryArtistId` and `durationMs`, so the per-play
  // `tracks` lookup is unnecessary.
  const res = await InfosModel.aggregate([
    ...basicMatch(user._id, start, end),
    {
      $project: {
        ...getGroupByDateProjection(user.settings.timezone),
        primaryArtistId: 1,
        durationMs: 1,
      },
    },
    {
      $group: {
        _id: {
          ...getGroupingByTimeSplit(timeSplit),
          art: "$primaryArtistId",
        },
        count: { $sum: getTrackSumType(user, "$durationMs") },
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

export const getBest = (
  itemType: ItemType,
  user: User,
  start: Date,
  end: Date,
  nb: number,
  offset: number,
) =>
  InfosModel.aggregate([
    ...basicMatch(user._id, start, end),
    {
      $group: {
        _id: itemType.field,
        duration_ms: { $sum: "$durationMs" },
        count: { $sum: 1 },
        trackId: { $first: "$id" },
        albumId: { $first: "$albumId" },
        primaryArtistId: { $first: "$primaryArtistId" },
        trackIds: { $addToSet: "$id" },
      },
    },
    { $addFields: { differents: { $size: "$trackIds" } } },
    {
      $facet: {
        infos: [
          { $sort: { [getTrackSortType(user)]: -1, _id: 1 } },
          { $skip: offset },
          { $limit: nb },
        ],
        computations: [
          {
            $group: {
              _id: null,
              total_duration_ms: { $sum: "$duration_ms" },
              total_count: { $sum: "$count" },
            },
          },
        ],
      },
    },
    { $unwind: "$infos" },
    { $unwind: "$computations" },
    {
      $project: {
        _id: "$infos._id",
        result: {
          $mergeObjects: ["$infos", "$computations"],
        },
      },
    },
    {
      $replaceRoot: {
        newRoot: {
          $mergeObjects: ["$result", { _id: "$_id" }],
        },
      },
    },
    { $lookup: lightTrackLookupPipeline("trackId") },
    { $unwind: "$track" },
    { $lookup: lightAlbumLookupPipeline("albumId") },
    { $unwind: "$album" },
    { $lookup: lightArtistLookupPipeline("primaryArtistId", false) },
    { $unwind: "$artist" },
  ]);

export const getBestOfHour = async (
  itemType: ItemType,
  user: User,
  start: Date,
  end: Date,
) => {
  const bestOfHour = await InfosModel.aggregate([
    ...basicMatch(user._id, start, end),
    {
      $group: {
        _id: {
          hour: getGroupByDateProjection(user.settings.timezone).hour,
          itemId: itemType.field,
        },
        total: { $sum: 1 },
      },
    },
    { $sort: { total: -1 } },
    {
      $group: {
        _id: "$_id.hour",
        items: {
          $push: { itemId: "$_id.itemId", total: "$total" },
        },
        total: { $sum: "$total" },
      },
    },
    {
      $project: {
        hour: "$_id",
        total: "$total",
        items: { $slice: ["$items", 20] },
      },
    },
    {
      $lookup: {
        from: itemType.collection,
        localField: "items.itemId",
        foreignField: "id",
        as: "full_items",
      },
    },
    { $sort: { _id: 1 } },
  ]);
  bestOfHour.forEach((hour: any) => {
    hour.full_items = Object.fromEntries(
      hour.full_items.map((e: any) => [e.id, e]),
    );
  });
  return bestOfHour;
};

export const getLongestListeningSession = async (
  userId: string,
  start: Date,
  end: Date,
) => {
  const sessionBreakThreshold = 10 * 60 * 1000;

  // Sessionize by gap-detection: pull each row's previous played_at/durationMs
  // via $shift, flag rows whose gap exceeds the threshold as session starts,
  // then cumulative-sum the flags to assign a session id. This replaces an
  // earlier $reduce + $concatArrays implementation that was O(N²) in the
  // number of plays.
  const longestSessions = await InfosModel.aggregate([
    ...basicMatch(userId, start, end),
    { $sort: { played_at: 1 } },
    {
      $setWindowFields: {
        partitionBy: "$owner",
        sortBy: { played_at: 1 },
        output: {
          _prevPlayedAt: { $shift: { output: "$played_at", by: -1 } },
          _prevDurationMs: { $shift: { output: "$durationMs", by: -1 } },
        },
      },
    },
    {
      $addFields: {
        subtract: {
          $cond: [
            { $ifNull: ["$_prevPlayedAt", false] },
            {
              $subtract: [
                "$played_at",
                { $add: ["$_prevPlayedAt", "$_prevDurationMs"] },
              ],
            },
            sessionBreakThreshold + 1,
          ],
        },
      },
    },
    {
      $setWindowFields: {
        partitionBy: "$owner",
        sortBy: { played_at: 1 },
        output: {
          _sessionId: {
            $sum: {
              $cond: [{ $gt: ["$subtract", sessionBreakThreshold] }, 1, 0],
            },
            window: { documents: ["unbounded", "current"] },
          },
        },
      },
    },
    {
      $group: {
        _id: { owner: "$owner", sessionId: "$_sessionId" },
        distance: {
          $push: {
            subtract: "$subtract",
            info: {
              _id: "$_id",
              owner: "$owner",
              id: "$id",
              albumId: "$albumId",
              primaryArtistId: "$primaryArtistId",
              artistIds: "$artistIds",
              durationMs: "$durationMs",
              played_at: "$played_at",
              blacklistedBy: "$blacklistedBy",
            },
          },
        },
        firstPlayedAt: { $min: "$played_at" },
        lastPlayedAt: { $max: "$played_at" },
      },
    },
    {
      $addFields: {
        sessionLength: { $subtract: ["$lastPlayedAt", "$firstPlayedAt"] },
      },
    },
    { $sort: { sessionLength: -1 } },
    { $limit: 5 },
    {
      $project: {
        _id: "$_id.owner",
        sessionLength: 1,
        distanceToLast: { distance: "$distance" },
      },
    },
    {
      $lookup: {
        from: "tracks",
        localField: "distanceToLast.distance.info.id",
        foreignField: "id",
        as: "full_tracks",
      },
    },
  ]);

  longestSessions.forEach(longestSession => {
    longestSession.full_tracks = Object.fromEntries(
      longestSession.full_tracks.map((track: any) => [track.id, track]),
    );
  });

  return longestSessions;
};

export const getRankOf = async (
  itemType: ItemType,
  user: User,
  itemId: string,
) => {
  const res = await InfosModel.aggregate([
    { $match: { owner: user._id } },
    { $group: { _id: itemType.field, count: { $sum: 1 } } },
    { $sort: { count: -1, _id: 1 } },
    { $group: { _id: 1, array: { $push: { id: "$_id", count: "$count" } } } },
    {
      $project: {
        index: { $indexOfArray: ["$array.id", itemId] },
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
