import mongoose from 'mongoose';
import { InfosModel } from '../Models';
import {
  lightAlbumLookupPipeline,
  lightArtistLookupPipeline,
  lightTrackLookupPipeline,
} from './statsTools';

function fromPairs<K extends string, V>(pairs: [K, V][]) {
  return pairs.reduce<Record<K, V>>((acc, [key, value]) => {
    acc[key] = value;
    return acc;
  }, {} as Record<K, V>);
}

export enum CollaborativeMode {
  AVERAGE = 'average',
  MINIMA = 'minima',
}

export const getCollaborativeBestSongs = (
  _users: string[],
  start: Date,
  end: Date,
  mode: CollaborativeMode,
) => {
  const users = _users.map(u => new mongoose.Types.ObjectId(u));
  return InfosModel.aggregate([
    {
      $match: {
        owner: { $in: users },
        played_at: { $gt: start, $lt: end },
      },
    },
    {
      $addFields: fromPairs(
        users.map(user => [
          user.toString(),
          { $cond: [{ $eq: ['$owner', user] }, 1, 0] },
        ]),
      ),
    },
    {
      $group: {
        _id: null,
        data: { $push: '$$ROOT' },
        ...fromPairs(
          users.map(user => [
            `total_${user.toString()}`,
            { $sum: `$${user.toString()}` },
          ]),
        ),
      },
    },
    { $unwind: '$data' },
    {
      $group: {
        _id: '$data.id',
        ...fromPairs(
          users.map(user => [
            user.toString(),
            { $sum: `$data.${user.toString()}` },
          ]),
        ),
        ...fromPairs(
          users.map(user => [
            `total_${user.toString()}`,
            { $first: `$total_${user.toString()}` },
          ]),
        ),
      },
    },
    {
      $addFields: fromPairs(
        users.map(user => [
          `percent_${user.toString()}`,
          { $divide: [`$${user.toString()}`, `$total_${user.toString()}`] },
        ]),
      ),
    },
    {
      $addFields: {
        average_percents: {
          $divide: [
            { $sum: users.map(user => `$percent_${user.toString()}`) },
            users.length,
          ],
        },
        minima: {
          $min: users.map(user => `$percent_${user.toString()}`),
        },
      },
    },
    {
      $sort: {
        [mode === CollaborativeMode.AVERAGE ? 'average_percents' : 'minima']:
          -1,
      },
    },
    { $limit: 50 },
    { $lookup: lightTrackLookupPipeline('_id') },
    { $unwind: '$track' },
    { $lookup: lightAlbumLookupPipeline() },
    { $unwind: '$album' },
    { $lookup: lightArtistLookupPipeline() },
    { $unwind: '$artist' },
  ]);
};

export const getCollaborativeBestAlbums = (
  _users: string[],
  start: Date,
  end: Date,
  mode: CollaborativeMode,
) => {
  const users = _users.map(u => new mongoose.Types.ObjectId(u));
  return InfosModel.aggregate([
    {
      $match: {
        owner: { $in: users },
        played_at: { $gt: start, $lt: end },
      },
    },
    {
      $addFields: fromPairs(
        users.map(user => [
          user.toString(),
          { $cond: [{ $eq: ['$owner', user] }, 1, 0] },
        ]),
      ),
    },
    {
      $group: {
        _id: null,
        data: { $push: '$$ROOT' },
        ...fromPairs(
          users.map(user => [
            `total_${user.toString()}`,
            { $sum: `$${user.toString()}` },
          ]),
        ),
      },
    },
    { $unwind: '$data' },
    { $lookup: lightTrackLookupPipeline('data.id') },
    { $unwind: '$track' },
    {
      $group: {
        _id: '$track.album',
        ...fromPairs(
          users.map(user => [
            user.toString(),
            { $sum: `$data.${user.toString()}` },
          ]),
        ),
        ...fromPairs(
          users.map(user => [
            `total_${user.toString()}`,
            { $first: `$total_${user.toString()}` },
          ]),
        ),
      },
    },
    {
      $addFields: fromPairs(
        users.map(user => [
          `percent_${user.toString()}`,
          { $divide: [`$${user.toString()}`, `$total_${user.toString()}`] },
        ]),
      ),
    },
    {
      $addFields: {
        average_percents: {
          $divide: [
            { $sum: users.map(user => `$percent_${user.toString()}`) },
            users.length,
          ],
        },
        minima: {
          $min: users.map(user => `$percent_${user.toString()}`),
        },
      },
    },
    {
      $sort: {
        [mode === CollaborativeMode.AVERAGE ? 'average_percents' : 'minima']:
          -1,
      },
    },
    { $limit: 50 },
    { $lookup: lightAlbumLookupPipeline('_id') },
    { $unwind: '$album' },
    { $lookup: lightArtistLookupPipeline('album.artists') },
    { $unwind: '$artist' },
  ]);
};

export const getCollaborativeBestArtists = (
  _users: string[],
  start: Date,
  end: Date,
  mode: CollaborativeMode,
) => {
  const users = _users.map(u => new mongoose.Types.ObjectId(u));
  return InfosModel.aggregate([
    {
      $match: {
        owner: { $in: users },
        played_at: { $gt: start, $lt: end },
      },
    },
    {
      $addFields: fromPairs(
        users.map(user => [
          user.toString(),
          { $cond: [{ $eq: ['$owner', user] }, 1, 0] },
        ]),
      ),
    },
    {
      $group: {
        _id: null,
        data: { $push: '$$ROOT' },
        ...fromPairs(
          users.map(user => [
            `total_${user.toString()}`,
            { $sum: `$${user.toString()}` },
          ]),
        ),
      },
    },
    { $unwind: '$data' },
    { $lookup: lightTrackLookupPipeline('data.id') },
    { $unwind: '$track' },
    { $addFields: { 'track.artist': { $first: '$track.artists' } } },
    {
      $group: {
        _id: '$track.artist',
        ...fromPairs(
          users.map(user => [
            user.toString(),
            { $sum: `$data.${user.toString()}` },
          ]),
        ),
        ...fromPairs(
          users.map(user => [
            `total_${user.toString()}`,
            { $first: `$total_${user.toString()}` },
          ]),
        ),
      },
    },
    {
      $addFields: fromPairs(
        users.map(user => [
          `percent_${user.toString()}`,
          { $divide: [`$${user.toString()}`, `$total_${user.toString()}`] },
        ]),
      ),
    },
    {
      $addFields: {
        average_percents: {
          $divide: [
            { $sum: users.map(user => `$percent_${user.toString()}`) },
            users.length,
          ],
        },
        minima: {
          $min: users.map(user => `$percent_${user.toString()}`),
        },
      },
    },
    {
      $sort: {
        [mode === CollaborativeMode.AVERAGE ? 'average_percents' : 'minima']:
          -1,
      },
    },
    { $limit: 50 },
    { $lookup: lightArtistLookupPipeline('_id', false) },
    { $unwind: '$artist' },
  ]);
};
