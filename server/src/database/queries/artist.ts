import { Timesplit } from '../../tools/types';
import { ArtistModel, InfosModel } from '../Models';
import { User } from '../schemas/user';
import { getGroupByDateProjection, getGroupingByTimeSplit } from './statsTools';

export const getArtists = (artistIds: string[]) =>
  ArtistModel.find({ id: { $in: artistIds } });

export const searchArtist = (str: string) =>
  ArtistModel.find({ name: { $regex: new RegExp(str, 'i') } });

export const getArtistInfos = (artistId: string) => [
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

export const getFirstAndLastListened = async (user: User, artistId: string) => {
  const res = await InfosModel.aggregate([
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
    ...['first', 'last']
      .map(e => [
        {
          $lookup: {
            from: 'tracks',
            localField: `${e}.artistInfos.trackId`,
            foreignField: 'id',
            as: `${e}.track`,
          },
        },
        { $unwind: `$${e}.track` },
        {
          $lookup: {
            from: 'albums',
            localField: `${e}.track.album`,
            foreignField: 'id',
            as: `${e}.track.album`,
          },
        },
        { $unwind: `$${e}.track.album` },
      ])
      .flat(1),
  ]);
  return res[0];
};

export const getMostListenedSongOfArtist = async (
  user: User,
  artistId: string,
) => {
  const res = await InfosModel.aggregate([
    { $match: { owner: user._id } },
    ...getArtistInfos(artistId),
    { $group: { _id: '$id', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: 'tracks',
        localField: '_id',
        foreignField: 'id',
        as: 'track',
      },
    },
    { $unwind: '$track' },
    {
      $lookup: {
        from: 'albums',
        localField: 'track.album',
        foreignField: 'id',
        as: 'track.album',
      },
    },
    { $unwind: '$track.album' },
  ]);
  return res;
};

export const bestPeriodOfArtist = async (user: User, artistId: string) => {
  const res = await InfosModel.aggregate([
    { $match: { owner: user._id } },
    ...getArtistInfos(artistId),
    { $project: { ...getGroupByDateProjection(), artistInfos: 1 } },
    {
      $group: { _id: null, items: { $push: '$$CURRENT' }, total: { $sum: 1 } },
    },
    { $unwind: '$items' },
    {
      $group: {
        _id: getGroupingByTimeSplit(Timesplit.month, 'items'),
        artist: { $last: '$items' },
        count: { $sum: 1 },
        total: { $last: '$total' },
      },
    },
    { $sort: { count: -1 } },
    { $limit: 2 },
  ]);
  return res;
};

export const getTotalListeningOfArtist = async (
  user: User,
  artistId: string,
) => {
  const res = await InfosModel.aggregate([
    { $match: { owner: user._id } },
    ...getArtistInfos(artistId),
    {
      $group: {
        _id: 1,
        count: { $sum: 1 },
        differents: { $addToSet: '$id' },
      },
    },
    { $unwind: '$differents' },
    {
      $group: {
        _id: '$_id',
        count: { $first: '$count' },
        differents: { $sum: 1 },
      },
    },
  ]);
  return res[0];
};

export const getRankOfArtist = async (user: User, artistId: string) => {
  const res = await InfosModel.aggregate([
    { $match: { owner: user._id } },
    {
      $lookup: {
        from: 'tracks',
        localField: 'id',
        foreignField: 'id',
        as: 'track',
      },
    },
    { $unwind: '$track' },
    {
      $group: {
        _id: { $arrayElemAt: ['$track.artists', 0] },
        count: { $sum: 1 },
      },
    },
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
        isMax: {
          $cond: { if: { $eq: ['$index', 0] }, then: true, else: false },
        },
        isMin: {
          $cond: {
            if: { $eq: ['$index', { $subtract: [{ $size: '$array' }, 1] }] },
            then: true,
            else: false,
          },
        },
        results: {
          $slice: ['$array', { $max: [{ $subtract: ['$index', 1] }, 0] }, 3],
        },
      },
    },
  ]);
  return res[0];
};

export const getDayRepartitionOfArtist = (user: User, artistId: string) =>
  InfosModel.aggregate([
    { $match: { owner: user._id } },
    { $addFields: getGroupByDateProjection() },
    ...getArtistInfos(artistId),
    {
      $lookup: {
        from: 'tracks',
        localField: 'artistInfos.trackId',
        foreignField: 'id',
        as: 'track',
      },
    },
    { $unwind: '$track' },
    {
      $group: {
        _id: '$hour',
        count: { $sum: 1 },
        duration: { $sum: '$track.duration_ms' },
      },
    },
    { $sort: { _id: 1 } },
  ]);
