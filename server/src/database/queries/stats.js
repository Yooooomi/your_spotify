const { Infos } = require('../Schemas');

const {
  getGroupByDateProjection,
  getGroupingByTimeSplit,
  sortByTimeSplit,
} = require('./statsTools');

const getMostListenedSongs = async (userId, start, end, timeSplit = 'hour') => {
  const res = await Infos.aggregate([
    { $match: { owner: userId, played_at: { $gt: start, $lt: end } } },
    { $project: { ...getGroupByDateProjection(), id: 1 } },

    { $group: { _id: { ...getGroupingByTimeSplit(timeSplit), track: '$id' }, count: { $sum: 1 } } },
    { $sort: { count: -1, '_id.track': 1 } },
    { $group: { _id: getGroupingByTimeSplit(timeSplit, '_id'), tracks: { $push: '$_id.track' }, counts: { $push: '$count' } } },
    { $project: { _id: 1, tracks: { $slice: ['$tracks', 10] }, counts: { $slice: ['$counts', 10] } } },
    { $unwind: { path: '$tracks', includeArrayIndex: 'trackIdx' } },
    { $lookup: { from: 'tracks', localField: 'tracks', foreignField: 'id', as: 'tracks' } },
    { $unwind: '$tracks' },
    { $lookup: { from: 'albums', localField: 'tracks.album', foreignField: 'id', as: 'tracks.album' } },
    { $unwind: '$tracks.album' },
    {
      $group: {
        _id: getGroupingByTimeSplit(timeSplit, '_id'),
        tracks: { $push: '$tracks' },
        counts: { $push: { $arrayElemAt: ['$counts', '$trackIdx'] } }
      }
    },
    ...sortByTimeSplit(timeSplit, '_id'),
  ]);
  return res;
}

const getMostListenedArtist = async (userId, start, end, timeSplit = 'hour') => {
  const res = await Infos.aggregate([
    { $match: { owner: userId, played_at: { $gt: start, $lt: end } } },
    { $project: { ...getGroupByDateProjection(), id: 1 } },
    { $lookup: { from: 'tracks', localField: 'id', foreignField: 'id', as: 'track' } },
    { $unwind: '$track' },
    { $group: { _id: { ...getGroupingByTimeSplit(timeSplit), art: { $arrayElemAt: ['$track.artists', 0] } }, count: { $sum: 1 } } },
    { $sort: { count: -1, '_id.art': 1 } },
    { $group: { _id: getGroupingByTimeSplit(timeSplit, '_id'), artists: { $push: '$_id.art' }, counts: { $push: '$count' } } },
    { $project: { _id: 1, artists: { $slice: ['$artists', 10] }, counts: { $slice: ['$counts', 10] } } },
    { $unwind: { path: '$artists', includeArrayIndex: 'artIdx' } },
    { $lookup: { from: 'artists', localField: 'artists', foreignField: 'id', as: 'artists' } },
    { $unwind: '$artists' },
    {
      $group: {
        _id: getGroupingByTimeSplit(timeSplit, '_id'),
        artists: { $push: '$artists' },
        counts: { $push: { $arrayElemAt: ['$counts', '$artIdx'] } }
      }
    },
    ...sortByTimeSplit(timeSplit, '_id'),
  ]);
  return res;
}

const getSongsPer = async (userId, start, end, timeSplit = 'day') => {
  const res = await Infos.aggregate([
    { $match: { owner: userId, played_at: { $gt: start, $lt: end } } },
    { $project: getGroupByDateProjection(), },
    { $group: { _id: getGroupingByTimeSplit(timeSplit), count: { "$sum": 1 } } },
  ]);
  return res;
}

const getTimePer = async (userId, start, end, timeSplit = 'day') => {
  const res = await Infos.aggregate([
    { $match: { owner: userId, played_at: { $gt: start, $lt: end } } },
    {
      $project: {
        ...getGroupByDateProjection(),
        id: 1,
      }
    },
    { $lookup: { from: 'tracks', localField: 'id', foreignField: 'id', as: 'track' } },
    { $unwind: '$track' },
    {
      $group: {
        _id: getGroupingByTimeSplit(timeSplit),
        count: { "$sum": '$track.duration_ms' },
      }
    },
    ...sortByTimeSplit(timeSplit, '_id'),
  ]);
  return res;
}

const albumDateRatio = async (userId, start, end, timeSplit = 'day') => {
  const res = await Infos.aggregate([
    { $match: { owner: userId, played_at: { $gt: start, $lt: end } } },
    {
      $project: {
        ...getGroupByDateProjection(),
        id: 1,
      }
    },
    { $lookup: { from: 'tracks', localField: 'id', foreignField: 'id', as: 'track' } },
    { $unwind: '$track' },
    { $lookup: { from: 'albums', localField: 'track.album', foreignField: 'id', as: 'album' } },
    { $unwind: '$album' },
    {
      $group: {
        _id: getGroupingByTimeSplit(timeSplit),
        totalYear: { "$sum": { $toInt: { $arrayElemAt: [{ $split: ['$album.release_date', '-'] }, 0] } } },
        count: { $sum: 1 },
      }
    },
    { $project: { _id: 1, totalYear: { $divide: ['$totalYear', '$count'] }, count: 1 } },
    ...sortByTimeSplit(timeSplit, '_id'),
  ]);

  return res;
}

const featRatio = async (userId, start, end, timeSplit) => {
  const res = await Infos.aggregate([
    { $match: { owner: userId, played_at: { $gt: start, $lt: end } } },
    {
      $project: {
        ...getGroupByDateProjection(),
        id: 1,
      }
    },
    { $lookup: { from: 'tracks', localField: 'id', foreignField: 'id', as: 'track' } },
    { $unwind: '$track' },
    {
      $group: {
        _id: getGroupingByTimeSplit(timeSplit),
        '1': { $sum: { $cond: { if: { $eq: [{ $size: '$track.artists' }, 1] }, then: 1, else: 0 } } },
        '2': { $sum: { $cond: { if: { $eq: [{ $size: '$track.artists' }, 2] }, then: 1, else: 0 } } },
        '3': { $sum: { $cond: { if: { $eq: [{ $size: '$track.artists' }, 3] }, then: 1, else: 0 } } },
        '4': { $sum: { $cond: { if: { $eq: [{ $size: '$track.artists' }, 4] }, then: 1, else: 0 } } },
        '5': { $sum: { $cond: { if: { $eq: [{ $size: '$track.artists' }, 5] }, then: 1, else: 0 } } },
        totalPeople: { $sum: { $size: '$track.artists' } },
        count: { $sum: 1 },
      }
    },
    { $project: { _id: 1, '1': 1, '2': 1, '3': 1, '4': 1, '5': 1, count: 1, totalPeople: 1, average: { $divide: ['$totalPeople', '$count'] } } },
    ...sortByTimeSplit(timeSplit, '_id'),
  ]);
  return res;
}

const popularityPer = async (userId, start, end, timeSplit = 'day') => {
  const res = await Infos.aggregate([
    { $match: { owner: userId, played_at: { $gt: start, $lt: end } } },
    {
      $project: {
        ...getGroupByDateProjection(),
        id: 1,
      }
    },
    { $lookup: { from: 'tracks', localField: 'id', foreignField: 'id', as: 'track' } },
    { $unwind: '$track' },
    {
      $group: {
        _id: getGroupingByTimeSplit(timeSplit),
        totalPopularity: { "$sum": '$track.popularity' },
        count: { $sum: 1 },
      }
    },
    { $project: { _id: 1, totalPopularity: { $divide: ['$totalPopularity', '$count'] }, count: 1 } },
    ...sortByTimeSplit(timeSplit, '_id'),
  ]);
  return res;
}

const differentArtistsPer = async (userId, start, end, timeSplit = 'day') => {
  const res = await Infos.aggregate([
    { $match: { owner: userId, played_at: { $gt: start, $lt: end } } },
    {
      $project: {
        ...getGroupByDateProjection(),
        id: 1,
      }
    },
    { $lookup: { from: 'tracks', localField: 'id', foreignField: 'id', as: 'track' } },
    { $unwind: '$track' },
    {
      $group: {
        _id: { ...getGroupingByTimeSplit(timeSplit), artId: { $arrayElemAt: ['$track.artists', 0] } },
        count: { $sum: 1 },
      }
    },
    { $sort: { count: -1, '_id.artId': 1 } },
    { $lookup: { from: 'artists', localField: '_id.artId', foreignField: 'id', as: 'artist' } },
    { $unwind: '$artist' },
    {
      $group: {
        _id: getGroupingByTimeSplit(timeSplit, '_id'),
        artists: { $push: '$artist' },
        differents: { $sum: 1 },
        counts: { $push: '$count' },
      }
    },
    ...sortByTimeSplit(timeSplit, '_id'),
  ]);

  return res;
}

module.exports = {
  getMostListenedSongs,
  getMostListenedArtist,
  getSongsPer,
  getTimePer,
  albumDateRatio,
  featRatio,
  popularityPer,
  differentArtistsPer
}
