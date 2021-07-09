const { Infos, Artist } = require('../Schemas');
const { getGroupByDateProjection, getGroupingByTimeSplit } = require('./statsTools');

const getArtist = (artistId) => Artist.findOne({ id: artistId });

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
  return res;
};

const getMostListenedSongOfArtist = async (user, artistId) => {
  const res = await Infos.aggregate([
    { $match: { owner: user._id } },
    ...getArtistInfos(artistId),
    { $group: { _id: '$id', count: { $sum: 1 } } },
    { $sort: { count: 1 } },
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
    { $group: { _id: getGroupingByTimeSplit('month'), count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 2 },
    { $sort: { count: 1 } },
  ]);
  return res;
};

const getTotalListeningOfArtist = async (user, artistId) => {
  const res = await Infos.aggregate([
    { $match: { owner: user._id } },
    ...getArtistInfos(artistId),
    { $group: { _id: 1, count: { $sum: 1 } } },
  ]);
  return res;
};

module.exports = {
  getArtist,
  getFirstAndLastListened,
  getMostListenedSongOfArtist,
  bestPeriodOfArtist,
  getTotalListeningOfArtist,
};
