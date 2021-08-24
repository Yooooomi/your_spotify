const { Infos, Artist } = require('../Schemas');
const { getGroupByDateProjection, getGroupingByTimeSplit } = require('./statsTools');

const getArtist = (artistId) => Artist.findOne({ id: artistId });

const searchArtist = (str) => Artist.find({ name: { $regex: new RegExp(str, 'i') } });

const getArtistInfos = artistId => [
  {
    $lookup: {
      from: 'tracks',
      let: { targetId: '$id' },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [
                { $eq: ['$id', '$$targetId'] },
                { $eq: [{ $first: '$artists' }, artistId] },
              ],
            },
          },
        },
        { $project: { trackId: '$id', artistId: { $first: '$artists' } } },
      ],
      as: 'artistInfos',
    },
  },
  { $match: { 'artistInfos.artistId': { $exists: true } } },
  { $unwind: '$artistInfos' },
];

const getFirstAndLastListened = async (user, artistId) => {
  const res = await Infos.aggregate([
    { $match: { owner: user._id } },
    ...getArtistInfos(artistId),
    { $sort: { played_at: 1 } },
    {
      $group: {
        _id: null,
        first: { $first: '$$ROOT' },
        last: { $last: '$$ROOT' },
      },
    },
    ...['first', 'last'].map(e => ([{
      $lookup: {
        from: 'tracks', localField: `${e}.artistInfos.trackId`, foreignField: 'id', as: `${e}.track`,
      },
    },
    { $unwind: `$${e}.track` }])).flat(1),
  ]);
  return res[0];
};

const getMostListenedSongOfArtist = async (user, artistId) => {
  const res = await Infos.aggregate([
    { $match: { owner: user._id } },
    ...getArtistInfos(artistId),
    { $group: { _id: '$id', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: 'tracks', localField: '_id', foreignField: 'id', as: 'track',
      },
    },
    { $unwind: '$track' },
  ]);
  return res;
};

const bestPeriodOfArtist = async (user, artistId) => {
  const res = await Infos.aggregate([
    { $match: { owner: user._id } },
    ...getArtistInfos(artistId),
    { $project: { ...getGroupByDateProjection(), artistInfos: 1 } },
    { $group: { _id: null, items: { $push: '$$CURRENT' }, total: { $sum: 1 } } },
    { $unwind: '$items' },
    { $group: { _id: getGroupingByTimeSplit('month', 'items'), artist: { $last: '$items' }, count: { $sum: 1 }, total: { $last: '$total' } } },
    { $sort: { count: -1 } },
    { $limit: 2 },
  ]);
  return res;
};

const getTotalListeningOfArtist = async (user, artistId) => {
  const res = await Infos.aggregate([
    { $match: { owner: user._id } },
    ...getArtistInfos(artistId),
    { $group: { _id: 1, count: { $sum: 1 } } },
  ]);
  return res[0];
};

const getRankOfArtist = async (user, artistId) => {
  const res = await Infos.aggregate([
    { $match: { owner: user._id } },
    {
      $lookup: {
        from: 'tracks', localField: 'id', foreignField: 'id', as: 'track',
      },
    },
    { $unwind: '$track' },
    { $group: { _id: { $arrayElemAt: ['$track.artists', 0] }, count: { $sum: 1 } } },
    { $sort: { count: -1, _id: 1 } },
    { $group: { _id: 1, array: { $push: { id: '$_id', count: '$count' } } } },
    {
      $project: {
        index: { $indexOfArray: ['$array.id', artistId] },
        array: 1,
      },
    },
    {
      $project: {
        index: 1,
        isMax: { $cond: { if: { $eq: ['$index', 0] }, then: true, else: false } },
        isMin: { $cond: { if: { $eq: ['$index', { $subtract: [{ $size: '$array' }, 1] }] }, then: true, else: false } },
        results: {
          $slice: [
            '$array',
            { $max: [{ $subtract: ['$index', 1] }, 0] },
            3,
          ],
        },
      },
    },
  ]);
  return res[0];
};

module.exports = {
  getArtist,
  searchArtist,
  getFirstAndLastListened,
  getMostListenedSongOfArtist,
  bestPeriodOfArtist,
  getTotalListeningOfArtist,
  getRankOfArtist,
};
