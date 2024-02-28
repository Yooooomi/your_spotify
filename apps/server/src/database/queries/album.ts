import { AlbumModel, InfosModel } from '../Models';
import { User } from '../schemas/user';

export const getAlbums = (albumsId: string[]) =>
  AlbumModel.find({ id: { $in: albumsId } });

export const searchAlbum = (str: string) =>
  AlbumModel.find({ name: { $regex: new RegExp(str, 'i') } });

export const getAlbumInfos = (albumId: string) => [
  {
    $lookup: {
      from: 'tracks',
      let: { targetId: '$id' },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [
                { $eq: ['$album', albumId] },
                { $eq: ['$id', '$$targetId'] },
              ],
            },
          },
        },
        { $project: { trackId: '$id', albumId: '$album' } },
      ],
      as: 'albumInfos',
    }
  },
  { $match: { 'albumInfos.albumId': { $exists: true } } },
  { $unwind: '$albumInfos' }
]

export const getFirstAndLastListenedAlbum = async (user: User, albumId: string) => {
  const res = await InfosModel.aggregate([
    { $match: { owner: user._id } },
    ...getAlbumInfos(albumId),
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
            localField: `${e}.albumInfos.trackId`,
            foreignField: 'id',
            as: `${e}.track`,
          },
        },
        { $unwind: `$${e}.track` }
      ])
      .flat(1),
  ]);
  return res[0];
}

export const getAlbumSongs = async (user: User, albumId: string) => {
  const res = await InfosModel.aggregate([
    { $match: { owner: user._id } },
    ...getAlbumInfos(albumId),
    { $group: { _id: '$id', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    {
      $lookup: {
        from: 'tracks',
        localField: '_id',
        foreignField: 'id',
        as: 'track',
      },
    },
    { $unwind: '$track' },
  ]);
  return res;
}

export const getRankOfAlbum = async (user: User, albumId: string) => {
  const res = await InfosModel.aggregate([
    { $match: { owner: user._id } },
    { $lookup: {
      from: 'tracks',
      localField: 'id',
      foreignField: 'id',
      as: 'track',
    }},
    { $unwind: '$track' },
    { $group: {
      _id: '$track.album',
      count: { $sum: 1 }
    }},
    { $sort: { count: -1, _id: 1 } },
    { $group: { _id: 1, array: { $push: { id: '$_id', count: '$count' } } } },
    {
      $project: {
        index: {
          $indexOfArray: ['$array.id', albumId],
        },
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
    }
  ]);
  return res[0];
}