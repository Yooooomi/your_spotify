import { PipelineStage } from 'mongoose';
import { getWithDefault } from '../../tools/env';
import { Timesplit } from '../../tools/types';
import { User } from '../schemas/user';

export const getGroupingByTimeSplit = (timeSplit: Timesplit, prefix = '') => {
  if (prefix !== '') prefix = `${prefix}.`;
  if (timeSplit === Timesplit.all) return null;
  if (timeSplit === Timesplit.year) return { year: `$${prefix}year` };
  if (timeSplit === Timesplit.week) {
    return { year: `$${prefix}year`, week: `$${prefix}week` };
  }
  if (timeSplit === Timesplit.month) {
    return { year: `$${prefix}year`, month: `$${prefix}month` };
  }
  if (timeSplit === Timesplit.day) {
    return {
      year: `$${prefix}year`,
      month: `$${prefix}month`,
      day: `$${prefix}day`,
    };
  }
  if (timeSplit === Timesplit.hour) {
    return {
      year: `$${prefix}year`,
      month: `$${prefix}month`,
      day: `$${prefix}day`,
      hour: `$${prefix}hour`,
    };
  }
  return {};
};

export const sortByTimeSplit = (
  timeSplit: Timesplit,
  prefix = '',
): PipelineStage[] => {
  if (prefix !== '') prefix = `${prefix}.`;
  if (timeSplit === Timesplit.all) return [];
  if (timeSplit === Timesplit.year) {
    return [{ $sort: { [`${prefix}year`]: 1 } }];
  }
  if (timeSplit === Timesplit.week) {
    return [{ $sort: { [`${prefix}year`]: 1, [`${prefix}week`]: 1 } }];
  }
  if (timeSplit === Timesplit.month) {
    return [{ $sort: { [`${prefix}year`]: 1, [`${prefix}month`]: 1 } }];
  }
  if (timeSplit === Timesplit.day) {
    return [
      {
        $sort: {
          [`${prefix}year`]: 1,
          [`${prefix}month`]: 1,
          [`${prefix}day`]: 1,
        },
      },
    ];
  }
  if (timeSplit === Timesplit.hour) {
    return [
      {
        $sort: {
          [`${prefix}year`]: 1,
          [`${prefix}month`]: 1,
          [`${prefix}day`]: 1,
          [`${prefix}hour`]: 1,
        },
      },
    ];
  }
  return [];
};

export const getGroupByDateProjection = () => ({
  year: {
    $year: {
      date: '$played_at',
      timezone: getWithDefault('TIMEZONE', 'Europe/Paris'),
    },
  },
  month: {
    $month: {
      date: '$played_at',
      timezone: getWithDefault('TIMEZONE', 'Europe/Paris'),
    },
  },
  day: {
    $dayOfMonth: {
      date: '$played_at',
      timezone: getWithDefault('TIMEZONE', 'Europe/Paris'),
    },
  },
  week: {
    $week: {
      date: '$played_at',
      timezone: getWithDefault('TIMEZONE', 'Europe/Paris'),
    },
  },
  hour: {
    $hour: {
      date: '$played_at',
      timezone: getWithDefault('TIMEZONE', 'Europe/Paris'),
    },
  },
});

export const getTrackSumType = (user: User) => {
  if (user.settings.metricUsed === 'number') {
    return 1;
  }
  if (user.settings.metricUsed === 'duration') {
    return '$track.duration_ms';
  }
  return 1;
};

export const lightTrackLookupPipeline = (idField = 'id') => ({
  let: { id: `$${idField}` },
  pipeline: [
    { $match: { $expr: { $eq: ['$id', '$$id'] } } },
    {
      $project: {
        _id: 1,
        id: 1,
        name: 1,
        artists: 1,
        album: 1,
        images: 1,
        duration_ms: 1,
      },
    },
  ],
  from: 'tracks',
  as: 'track',
});

export const lightAlbumLookupPipeline = (idField = 'track.album') => ({
  let: { id: `$${idField}` },
  pipeline: [
    { $match: { $expr: { $eq: ['$id', '$$id'] } } },
    { $project: { _id: 1, id: 1, name: 1, artists: 1, images: 1 } },
  ],
  from: 'albums',
  as: 'album',
});

export const lightArtistLookupPipeline = (
  idField = 'track.artists',
  isFieldArray = true,
) => ({
  let: { id: isFieldArray ? { $first: `$${idField}` } : `$${idField}` },
  pipeline: [
    { $match: { $expr: { $eq: ['$id', '$$id'] } } },
    { $project: { _id: 1, id: 1, name: 1, images: 1, genres: 1 } },
  ],
  from: 'artists',
  as: 'artist',
});
