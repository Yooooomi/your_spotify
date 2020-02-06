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
  console.log('User !', user);
  return user.tracks;
}

const getSongsNbInterval = async (id, start, end) => {
  console.log('ID: ', id);
  const res = await Infos.aggregate([
    { $match: { owner: id, played_at: { $gt: start, $lt: end } } },
    { $group: { _id: null, count: { $sum: 1 } } }
  ]);
  return res[0].count;
}

const getMostListenedSongs = async (userId, start, end) => {
  const res = await Infos.aggregate([
    { $match: { owner: userId, played_at: { $gt: start, $lt: end } } },
    { $group: { _id: "$id", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 20 },
    { $lookup: { from: 'tracks', localField: '_id', foreignField: 'id', as: 'track' } },
    { $unwind: '$track' },
  ]);
  return res;
}

const getMostListenedArtist = async (userId, start, end) => {
  const res = await Infos.aggregate([
    { $match: { owner: userId, played_at: { $gt: start, $lt: end } } },
    { $lookup: { from: 'tracks', localField: 'id', foreignField: 'id', as: 'track' } },
    { $unwind: '$track' },
    { $group: { _id: { $arrayElemAt: ['$track.artists', 0] }, count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 20 },
  ]);
  return res;
}

const getGroupingByTimeSplit = timeSplit => {
  if (timeSplit === 'year') return { year: "$year" };
  if (timeSplit === 'week') return { year: "$year", month: "$week" };
  if (timeSplit === 'month') return { year: "$year", month: "$month" };
  if (timeSplit === 'day') return { year: "$year", month: "$month", day: "$day" };
  if (timeSplit === 'hour') return { year: "$year", month: "$month", day: "$day", hour: '$hour' };
  console.log('WYTFFYTFYFYF');
  return {};
}

const getGroupByDateProjection = () => ({
  year: { "$year": "$played_at" },
  month: { "$month": "$played_at" },
  day: { "$dayOfMonth": "$played_at" },
  week: { "$week": "$played_at" },
  hour: { "$hour": "$played_at" },
});

const getSongsPer = async (userId, start, end, timeSplit = 'day') => {
  const res = await Infos.aggregate([
    { $match: { owner: userId, played_at: { $gt: start, $lt: end } } },
    {
      $project: getGroupByDateProjection(),
    },
    {
      $group: {
        _id: getGroupingByTimeSplit(timeSplit),
        count: { "$sum": 1 }
      }
    }
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
    }
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
  ]);

  return res;
}

const featRatio = async (userId, start, end) => {
  const res = await Infos.aggregate([
    { $match: { owner: userId, played_at: { $gt: start, $lt: end } } },
    { $lookup: { from: 'tracks', localField: 'id', foreignField: 'id', as: 'track' } },
    { $unwind: '$track' },
    {
      $group: {
        _id: { $size: '$track.artists' },
        count: { "$sum": 1 },
      }
    }
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
};
