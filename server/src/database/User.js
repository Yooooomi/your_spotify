const { User, Track, Infos } = require('./Schemas');
const { NoResult } = require('../tools/errors/Database');

const getUserFromField = async (field, value, crash = true) => {
  const user = User.findOne({ [field]: value }, '-tracks');

  if (!user && crash) {
    throw new NoResult();
  }
  return user;
}

const createUser = (username, password) => {
  return User.create({
    username,
    password,
    activated: false,
    accessToken: '',
    refreshToken: '',
    expiresIn: 0,
  });
}

const storeInUser = (field, value, infos) => {
  return User.findOneAndUpdate({ [field]: value }, infos, { new: true });
}

const addTrackIdsToUser = async (id, infos) => {
  infos.forEach(info => info.owner = id);
  const infosSaved = await Infos.create(infos);
  return User.findByIdAndUpdate(id, { $push: { tracks: { $each: infosSaved.map(e => e._id.toString()) } } });
}

const getSongs = async (userId, offset, number) => {
  const fullUser = await User.findById(userId).populate(
    {
      path: 'tracks',
      model: 'Infos',
      options: { skip: offset, limit: number },
      populate: {
        path: 'track',
        model: 'Track',
        populate: [
          { path: 'full_album', model: 'Album' },
          { path: 'full_artist', model: 'Artist' },
        ]
      },
    },
  );
  return fullUser.tracks;
}

const getSongsInterval = async (id, start, end) => {
  const user = await User.findById(id).populate({
    path: 'tracks',
    match: {
      played_at: {
        $gte: start,
        $lt: end,
      },
    }
  });
  return user.tracks;
}

const getSongsNbInterval = async (id, start, end) => {
  const res = await Infos.aggregate([
    { $match: { owner: id, played_at: { $gt: start, $lt: end } } },
    { $group: { _id: null, count: { $sum: 1 } } }
  ]);
  return res[0].count;
}

const getGroupingByTimeSplit = (timeSplit, prefix = '') => {
  if (timeSplit === 'all') return null;
  if (timeSplit === 'year') return { year: `$${prefix}year` };
  if (timeSplit === 'week') return { year: `$${prefix}year`, week: `$${prefix}week` };
  if (timeSplit === 'month') return { year: `$${prefix}year`, month: `$${prefix}month` };
  if (timeSplit === 'day') return { year: `$${prefix}year`, month: `$${prefix}month`, day: `$${prefix}day` };
  if (timeSplit === 'hour') return { year: `$${prefix}year`, month: `$${prefix}month`, day: `$${prefix}day`, hour: `$${prefix}hour` };
  return {};
}

const sortByTimeSplit = (timeSplit, prefix = '') => {
  if (timeSplit === 'all') return [];
  if (timeSplit === 'year') return [{ $sort: { [`${prefix}year`]: 1 } }];
  if (timeSplit === 'week') return [{ $sort: { [`${prefix}year`]: 1, [`${prefix}week`]: 1 } }];
  if (timeSplit === 'month') return [{ $sort: { [`${prefix}year`]: 1, [`${prefix}month`]: 1 } }];
  if (timeSplit === 'day') return [{ $sort: { [`${prefix}year`]: 1, [`${prefix}month`]: 1, [`${prefix}day`]: 1 } }];
  if (timeSplit === 'hour') return [{ $sort: { [`${prefix}year`]: 1, [`${prefix}month`]: 1, [`${prefix}day`]: 1, [`${prefix}hour`]: 1 } }];
  return [];
}

const getGroupByDateProjection = () => ({
  year: { "$year": "$played_at" },
  month: { "$month": "$played_at" },
  day: { "$dayOfMonth": "$played_at" },
  week: { "$week": "$played_at" },
  hour: { "$hour": "$played_at" },
});

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
    {
      $group: {
        _id: { year: '$_id.year', month: '$_id.month', week: '$_id.week', day: '$_id.day', hour: '$_id.hour' },
        ids: { $push: '$_id.artId' },
        differents: { $sum: 1 },
      }
    },
    ...sortByTimeSplit(timeSplit, '_id'),
  ]);

  return res;
}

const getUsersNb = () => User.find().count();
const getUsers = (nb, offset, condition) => User.find(condition).limit(nb).skip(offset);

module.exports = {
  getUserFromField,
  createUser,
  storeInUser,
  getSongs,
  getUsersNb,
  getUsers,
  addTrackIdsToUser,
  getSongsNbInterval,
  getMostListenedSongs,
  getMostListenedArtist,
  getSongsPer,
  getTimePer,
  albumDateRatio,
  featRatio,
  popularityPer,
  differentArtistsPer,
};
