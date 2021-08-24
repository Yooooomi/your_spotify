const { Infos } = require('../Schemas');

const {
  getGroupByDateProjection,
  getGroupingByTimeSplit,
  sortByTimeSplit,
  getTrackSumType,
} = require('./statsTools');

const getMostListenedSongs = async (user, start, end, timeSplit = 'hour') => {
  const res = await Infos.aggregate([
    { $match: { owner: user._id, played_at: { $gt: start, $lt: end } } },
    { $project: { ...getGroupByDateProjection(), id: 1 } },

    { $group: { _id: { ...getGroupingByTimeSplit(timeSplit), track: '$id' }, count: { $sum: 1 } } },
    { $sort: { count: -1, '_id.track': 1 } },
    { $group: { _id: getGroupingByTimeSplit(timeSplit, '_id'), tracks: { $push: '$_id.track' }, counts: { $push: '$count' } } },
    { $project: { _id: 1, tracks: { $slice: ['$tracks', user.settings.nbElements] }, counts: { $slice: ['$counts', user.settings.nbElements] } } },
    { $unwind: { path: '$tracks', includeArrayIndex: 'trackIdx' } },
    {
      $lookup: {
        from: 'tracks', localField: 'tracks', foreignField: 'id', as: 'tracks',
      },
    },
    { $unwind: '$tracks' },
    {
      $lookup: {
        from: 'albums', localField: 'tracks.album', foreignField: 'id', as: 'tracks.album',
      },
    },
    { $unwind: '$tracks.album' },
    {
      $group: {
        _id: getGroupingByTimeSplit(timeSplit, '_id'),
        tracks: { $push: '$tracks' },
        counts: { $push: { $arrayElemAt: ['$counts', '$trackIdx'] } },
      },
    },
    ...sortByTimeSplit(timeSplit, '_id'),
  ]);
  return res;
};

const getMostListenedArtist = async (user, start, end, timeSplit = 'hour') => {
  const res = await Infos.aggregate([
    { $match: { owner: user._id, played_at: { $gt: start, $lt: end } } },
    { $project: { ...getGroupByDateProjection(), id: 1 } },
    {
      $lookup: {
        from: 'tracks', localField: 'id', foreignField: 'id', as: 'track',
      },
    },
    { $unwind: '$track' },
    { $group: { _id: { ...getGroupingByTimeSplit(timeSplit), art: { $arrayElemAt: ['$track.artists', 0] } }, count: { $sum: getTrackSumType(user) } } },
    { $sort: { count: -1, '_id.art': 1 } },
    { $group: { _id: getGroupingByTimeSplit(timeSplit, '_id'), artists: { $push: '$_id.art' }, counts: { $push: '$count' } } },
    { $project: { _id: 1, artists: { $slice: ['$artists', user.settings.nbElements] }, counts: { $slice: ['$counts', user.settings.nbElements] } } },
    { $unwind: { path: '$artists', includeArrayIndex: 'artIdx' } },
    {
      $lookup: {
        from: 'artists', localField: 'artists', foreignField: 'id', as: 'artists',
      },
    },
    { $unwind: '$artists' },
    {
      $group: {
        _id: getGroupingByTimeSplit(timeSplit, '_id'),
        artists: { $push: '$artists' },
        counts: { $push: { $arrayElemAt: ['$counts', '$artIdx'] } },
      },
    },
    ...sortByTimeSplit(timeSplit, '_id'),
  ]);
  return res;
};

const getSongsPer = async (user, start, end, timeSplit = 'day') => {
  const res = await Infos.aggregate([
    { $match: { owner: user._id, played_at: { $gt: start, $lt: end } } },
    { $project: { ...getGroupByDateProjection(), id: 1 } },
    { $group: { _id: getGroupingByTimeSplit(timeSplit), count: { $sum: 1 } } },
    ...sortByTimeSplit(timeSplit, '_id'),
  ]);
  return res;
};

const getTimePer = async (user, start, end, timeSplit = 'day') => {
  const res = await Infos.aggregate([
    { $match: { owner: user._id, played_at: { $gt: start, $lt: end } } },
    {
      $project: {
        ...getGroupByDateProjection(),
        id: 1,
      },
    },
    {
      $lookup: {
        from: 'tracks', localField: 'id', foreignField: 'id', as: 'track',
      },
    },
    { $unwind: '$track' },
    {
      $group: {
        _id: getGroupingByTimeSplit(timeSplit),
        count: { $sum: '$track.duration_ms' },
      },
    },
    ...sortByTimeSplit(timeSplit, '_id'),
  ]);
  return res;
};

const albumDateRatio = async (user, start, end, timeSplit = 'day') => {
  const res = await Infos.aggregate([
    { $match: { owner: user._id, played_at: { $gt: start, $lt: end } } },
    {
      $project: {
        ...getGroupByDateProjection(),
        id: 1,
      },
    },
    {
      $lookup: {
        from: 'tracks', localField: 'id', foreignField: 'id', as: 'track',
      },
    },
    { $unwind: '$track' },
    {
      $lookup: {
        from: 'albums', localField: 'track.album', foreignField: 'id', as: 'album',
      },
    },
    { $unwind: '$album' },
    {
      $group: {
        _id: getGroupingByTimeSplit(timeSplit),
        totalYear: { $sum: { $toInt: { $arrayElemAt: [{ $split: ['$album.release_date', '-'] }, 0] } } },
        count: { $sum: 1 },
      },
    },
    { $project: { _id: 1, totalYear: { $divide: ['$totalYear', '$count'] }, count: 1 } },
    ...sortByTimeSplit(timeSplit, '_id'),
  ]);

  return res;
};

const featRatio = async (user, start, end, timeSplit) => {
  const res = await Infos.aggregate([
    { $match: { owner: user._id, played_at: { $gt: start, $lt: end } } },
    {
      $project: {
        ...getGroupByDateProjection(),
        id: 1,
      },
    },
    {
      $lookup: {
        from: 'tracks', localField: 'id', foreignField: 'id', as: 'track',
      },
    },
    { $unwind: '$track' },
    {
      $group: {
        _id: getGroupingByTimeSplit(timeSplit),
        1: { $sum: { $cond: { if: { $eq: [{ $size: '$track.artists' }, 1] }, then: 1, else: 0 } } },
        2: { $sum: { $cond: { if: { $eq: [{ $size: '$track.artists' }, 2] }, then: 1, else: 0 } } },
        3: { $sum: { $cond: { if: { $eq: [{ $size: '$track.artists' }, 3] }, then: 1, else: 0 } } },
        4: { $sum: { $cond: { if: { $eq: [{ $size: '$track.artists' }, 4] }, then: 1, else: 0 } } },
        5: { $sum: { $cond: { if: { $eq: [{ $size: '$track.artists' }, 5] }, then: 1, else: 0 } } },
        totalPeople: { $sum: { $size: '$track.artists' } },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 1, 1: 1, 2: 1, 3: 1, 4: 1, 5: 1, count: 1, totalPeople: 1, average: { $divide: ['$totalPeople', '$count'] },
      },
    },
    ...sortByTimeSplit(timeSplit, '_id'),
  ]);
  return res;
};

const popularityPer = async (user, start, end, timeSplit = 'day') => {
  const res = await Infos.aggregate([
    { $match: { owner: user._id, played_at: { $gt: start, $lt: end } } },
    {
      $project: {
        ...getGroupByDateProjection(),
        id: 1,
      },
    },
    {
      $lookup: {
        from: 'tracks', localField: 'id', foreignField: 'id', as: 'track',
      },
    },
    { $unwind: '$track' },
    {
      $group: {
        _id: getGroupingByTimeSplit(timeSplit),
        totalPopularity: { $sum: '$track.popularity' },
        count: { $sum: 1 },
      },
    },
    { $project: { _id: 1, totalPopularity: { $divide: ['$totalPopularity', '$count'] }, count: 1 } },
    ...sortByTimeSplit(timeSplit, '_id'),
  ]);
  return res;
};

const differentArtistsPer = async (user, start, end, timeSplit = 'day') => {
  const res = await Infos.aggregate([
    { $match: { owner: user._id, played_at: { $gt: start, $lt: end } } },
    {
      $project: {
        ...getGroupByDateProjection(),
        id: 1,
      },
    },
    {
      $lookup: {
        from: 'tracks', localField: 'id', foreignField: 'id', as: 'track',
      },
    },
    { $unwind: '$track' },
    {
      $group: {
        _id: { ...getGroupingByTimeSplit(timeSplit), artId: { $arrayElemAt: ['$track.artists', 0] } },
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1, '_id.artId': 1 } },
    {
      $lookup: {
        from: 'artists', localField: '_id.artId', foreignField: 'id', as: 'artist',
      },
    },
    { $unwind: '$artist' },
    {
      $group: {
        _id: getGroupingByTimeSplit(timeSplit, '_id'),
        artists: { $push: '$artist' },
        differents: { $sum: 1 },
        counts: { $push: '$count' },
      },
    },
    ...sortByTimeSplit(timeSplit, '_id'),
  ]);

  return res;
};

const getDayRepartition = async (user, start, end) => {
  const res = await Infos.aggregate([
    { $match: { owner: user._id, played_at: { $gt: start, $lt: end } } },
    {
      $project: {
        ...getGroupByDateProjection(),
        id: 1,
      },
    },
    {
      $lookup: {
        from: 'tracks', localField: 'id', foreignField: 'id', as: 'track',
      },
    },
    { $unwind: '$track' },
    {
      $group: {
        _id: '$hour',
        count: { $sum: getTrackSumType(user) },
      },
    },
    { $sort: { _id: 1 } },
  ]);
  return res;
};

const getBestArtistsPer = async (user, start, end, timeSplit = 'day') => {
  const res = await Infos.aggregate([
    { $match: { owner: user._id, played_at: { $gt: start, $lt: end } } },
    { $project: { ...getGroupByDateProjection(), id: 1 } },
    {
      $lookup: {
        from: 'tracks', localField: 'id', foreignField: 'id', as: 'track',
      },
    },
    { $unwind: '$track' },
    { $group: { _id: { ...getGroupingByTimeSplit(timeSplit), art: { $arrayElemAt: ['$track.artists', 0] } }, count: { $sum: getTrackSumType(user) } } },
    { $sort: { count: -1, '_id.art': 1 } },
    { $group: { _id: getGroupingByTimeSplit(timeSplit, '_id'), artists: { $push: '$_id.art' }, counts: { $push: '$count' } } },
    { $project: { _id: 1, artists: { $slice: ['$artists', user.settings.nbElements] }, counts: { $slice: ['$counts', user.settings.nbElements] } } },
    { $unwind: { path: '$artists', includeArrayIndex: 'artIdx' } },
    {
      $lookup: {
        from: 'artists', localField: 'artists', foreignField: 'id', as: 'artists',
      },
    },
    { $unwind: '$artists' },
    {
      $group: {
        _id: getGroupingByTimeSplit(timeSplit, '_id'),
        artists: { $push: '$artists' },
        counts: { $push: { $arrayElemAt: ['$counts', '$artIdx'] } },
      },
    },
    ...sortByTimeSplit(timeSplit, '_id'),
  ]);
  return res;
};

const getBestSongsNbOffseted = (user, start, end, nb, offset) => {
  return Infos.aggregate([
    { $match: { owner: user._id, played_at: { $gt: start, $lt: end } } },
    { $project: { ...getGroupByDateProjection(), id: 1 } },
    {
      $lookup: {
        from: 'tracks', localField: 'id', foreignField: 'id', as: 'track',
      },
    },
    { $unwind: '$track' },

    // Adding the sum of the duration of all musics
    { $group: { _id: null, tracks: { $push: '$$ROOT' }, total_duration_ms: { $sum: '$track.duration_ms' }, total_count: { $sum: 1 } } },
    { $unwind: '$tracks' },
    { $addFields: { 'tracks.total_duration_ms': '$total_duration_ms', 'tracks.total_count': '$total_count' } },
    { $replaceRoot: { newRoot: '$tracks' } },

    { $group: { _id: '$track.id', track: { $last: '$track' }, total_count: { $last: '$total_count' }, total_duration_ms: { $last: '$total_duration_ms' }, duration_ms: { $sum: '$track.duration_ms' }, count: { $sum: 1 } } },
    { $sort: { count: -1, 'track.name': 1 } },
    { $skip: offset },
    { $limit: nb },
    { $addFields: { 'track.mainArtist': { $first: '$track.artists' } } },
    {
      $lookup: {
        from: 'artists', localField: 'track.mainArtist', foreignField: 'id', as: 'artist',
      },
    },
    { $unwind: '$artist' },
    {
      $lookup: {
        from: 'albums', localField: 'track.album', foreignField: 'id', as: 'album',
      },
    },
    { $unwind: '$album' },
  ]);
};

const getBestArtistsNbOffseted = (user, start, end, nb, offset) => {
  return Infos.aggregate([
    { $match: { owner: user._id, played_at: { $gt: start, $lt: end } } },
    { $project: { ...getGroupByDateProjection(), id: 1 } },
    {
      $lookup: {
        from: 'tracks', localField: 'id', foreignField: 'id', as: 'track',
      },
    },
    { $unwind: '$track' },

    // Adding the sum of the duration of all musics
    { $group: { _id: null, tracks: { $push: '$$ROOT' }, total_duration_ms: { $sum: '$track.duration_ms' }, total_count: { $sum: 1 } } },
    { $unwind: '$tracks' },
    { $addFields: { 'tracks.total_duration_ms': '$total_duration_ms', 'tracks.total_count': '$total_count' } },
    { $replaceRoot: { newRoot: '$tracks' } },

    { $group: { _id: { $first: '$track.artists' }, total_count: { $last: '$total_count' }, total_duration_ms: { $last: '$total_duration_ms' }, duration_ms: { $sum: '$track.duration_ms' }, count: { $sum: 1 } } },
    { $sort: { count: -1, _id: 1 } },
    { $skip: offset },
    { $limit: nb },
    {
      $lookup: {
        from: 'artists', localField: '_id', foreignField: 'id', as: 'artist',
      },
    },
    { $unwind: '$artist' },
  ]);
};

const getBestAlbumsNbOffseted = (user, start, end, nb, offset) => {
  return Infos.aggregate([
    { $match: { owner: user._id, played_at: { $gt: start, $lt: end } } },
    { $project: { ...getGroupByDateProjection(), id: 1 } },
    {
      $lookup: {
        from: 'tracks', localField: 'id', foreignField: 'id', as: 'track',
      },
    },
    { $unwind: '$track' },

    // Adding the sum of the duration of all musics
    { $group: { _id: null, tracks: { $push: '$$ROOT' }, total_duration_ms: { $sum: '$track.duration_ms' }, total_count: { $sum: 1 } } },
    { $unwind: '$tracks' },
    { $addFields: { 'tracks.total_duration_ms': '$total_duration_ms', 'tracks.total_count': '$total_count' } },
    { $replaceRoot: { newRoot: '$tracks' } },

    { $group: { _id: '$track.album', count: { $sum: 1 }, total_count: { $last: '$total_count' }, total_duration_ms: { $last: '$total_duration_ms' }, duration_ms: { $sum: '$track.duration_ms' }, artist: { $last: { $first: '$track.artists' } } } },
    { $sort: { count: -1, _id: 1 } },
    { $skip: offset },
    { $limit: nb },
    {
      $lookup: {
        from: 'artists', localField: 'artist', foreignField: 'id', as: 'artist',
      },
    },
    { $unwind: '$artist' },
    {
      $lookup: {
        from: 'albums', localField: '_id', foreignField: 'id', as: 'album',
      },
    },
    { $unwind: '$album' },
  ]);
};

module.exports = {
  getMostListenedSongs,
  getMostListenedArtist,
  getSongsPer,
  getTimePer,
  albumDateRatio,
  featRatio,
  popularityPer,
  differentArtistsPer,
  getDayRepartition,
  getBestArtistsPer,
  getBestSongsNbOffseted,
  getBestArtistsNbOffseted,
  getBestAlbumsNbOffseted,
};
