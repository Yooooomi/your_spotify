import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { getAppropriateTimesplitFromRange } from './date';
import { selectAccounts } from './redux/modules/admin/selector';
import { selectUser } from './redux/modules/user/selector';
import { fresh } from './stats';
import { getMinOfArray } from './tools';
import { Timesplit } from './types';
import { getFirstListenedAt } from './user';

export const lastDay = new Date();
lastDay.setDate(lastDay.getDate() - 1);
export const lastWeek = fresh(new Date(), true);
lastWeek.setDate(lastWeek.getDate() - 7);
lastWeek.setHours(0);
export const lastMonth = fresh(new Date(), true);
lastMonth.setMonth(lastMonth.getMonth() - 1);
lastMonth.setHours(0);
export const lastYear = fresh(new Date(), true);
lastYear.setFullYear(lastYear.getFullYear() - 1);
lastYear.setDate(1);
export const now = new Date();

export interface Interval {
  timesplit: Timesplit;
  start: Date;
  end: Date;
}

export interface PresetIntervalDetail {
  type: 'preset';
  name: string;
  unit: string;
  interval: Interval;
}

export interface CustomIntervalDetail {
  type: 'custom';
  name: 'custom';
  interval: Interval;
}

export interface UserBasedIntervalDetails {
  type: 'userbased';
  name: string;
  interval: (user: { firstListenedAt: string } | null) => Interval;
}

export type IntervalDetail =
  | PresetIntervalDetail
  | CustomIntervalDetail
  | UserBasedIntervalDetails;

export type RawIntervalDetail = {
  type: IntervalDetail['type'];
  name: string;
  interval: Interval;
  unit: string;
};

export const presetIntervals: PresetIntervalDetail[] = [
  {
    type: 'preset',
    name: 'Last day',
    unit: 'day',
    interval: { timesplit: Timesplit.hour, start: lastDay, end: now },
  },
  {
    type: 'preset',
    name: 'Last week',
    unit: 'week',
    interval: { timesplit: Timesplit.day, start: lastWeek, end: now },
  },
  {
    type: 'preset',
    name: 'Last month',
    unit: 'month',
    interval: { timesplit: Timesplit.day, start: lastMonth, end: now },
  },
  {
    type: 'preset',
    name: 'Last year',
    unit: 'year',
    interval: { timesplit: Timesplit.month, start: lastYear, end: now },
  },
];

export const userBasedIntervals: UserBasedIntervalDetails[] = [
  {
    type: 'userbased',
    name: 'All',
    interval: user => {
      const start = getFirstListenedAt(
        user ? new Date(user.firstListenedAt) : new Date(2010),
      );
      return {
        timesplit: getAppropriateTimesplitFromRange(start, now),
        start,
        end: now,
      };
    },
  },
];

export const allIntervals = [...presetIntervals, ...userBasedIntervals];

export function getPresetIndexFromIntervalDetail(
  details: PresetIntervalDetail,
) {
  return presetIntervals.findIndex(v => v.name === details.name);
}

export function getUserBasedIndexFromIntervalDetail(
  details: UserBasedIntervalDetails,
) {
  return userBasedIntervals.findIndex(v => v.name === details.name);
}

export function getAllIndexFromIntervalDetail(details: IntervalDetail) {
  return allIntervals.findIndex(
    v => v.type === details.type && v.name === details.name,
  );
}

export function optimisticGetIntervalDetailFromName(name: string) {
  return allIntervals.find(inter => inter.name === name);
}

export function getRawIntervalDetail(
  detail: IntervalDetail,
  user: { firstListenedAt: string } | null,
): RawIntervalDetail {
  if (detail.type === 'preset') {
    return {
      name: detail.name,
      type: 'preset',
      interval: detail.interval,
      unit: detail.unit,
    };
  }
  if (detail.type === 'userbased') {
    return {
      name: detail.name,
      type: 'userbased',
      interval: detail.interval(user),
      unit: 'period',
    };
  }
  return {
    name: detail.name,
    type: 'custom',
    interval: detail.interval,
    unit: 'period',
  };
}

export function detailIntervalToQuery(
  interval: IntervalDetail,
  prefix: string,
) {
  if (interval.type === 'custom') {
    return {
      [`${prefix}type`]: 'custom',
      [`${prefix}start`]: interval.interval.start.toString(),
      [`${prefix}end`]: interval.interval.end.toString(),
    };
  }
  return { [`${prefix}name`]: interval.name };
}

export function queryToIntervalDetail(
  urlSearchParams: URLSearchParams,
  prefix: string,
): IntervalDetail {
  let toReturn: IntervalDetail | undefined;
  const [type, start, end, name] = [
    urlSearchParams.get(`${prefix}type`),
    urlSearchParams.get(`${prefix}start`),
    urlSearchParams.get(`${prefix}end`),
    urlSearchParams.get(`${prefix}name`),
  ];
  try {
    if (type === 'custom' && start && end) {
      const dateStart = new Date(start);
      const dateEnd = new Date(end);
      const timesplit = getAppropriateTimesplitFromRange(dateStart, dateEnd);
      return {
        type: 'custom',
        name: 'custom',
        interval: { start: dateStart, end: dateEnd, timesplit },
      };
    }
    if (name) {
      toReturn = optimisticGetIntervalDetailFromName(decodeURIComponent(name));
    }
  } catch (e) {
    // Do nothing
  }
  return toReturn ?? presetIntervals[0];
}

export function useQueryToRawIntervalDetail(prefix: string) {
  const [query] = useSearchParams();
  const user = useSelector(selectUser);
  return useMemo(
    () => getRawIntervalDetail(queryToIntervalDetail(query, prefix), user),
    [prefix, query, user],
  );
}

export function useOldestListenedAtFromUsers(
  userIds: string[],
  prefix: string,
): RawIntervalDetail {
  const user = useSelector(selectUser);
  const users = useSelector(selectAccounts);
  const [query] = useSearchParams();

  const detail = useMemo(
    () => queryToIntervalDetail(query, prefix),
    [prefix, query],
  );

  const filtered = users.filter(us => [user?._id, ...userIds].includes(us.id));
  const mins = getMinOfArray(filtered, item =>
    new Date(item.firstListenedAt).getTime(),
  );
  const account = filtered[mins?.minIndex ?? 0];
  const accountInterval = useMemo(
    () => getRawIntervalDetail(detail, account),
    [account, detail],
  );

  if (!account && detail.type === 'userbased') {
    return getRawIntervalDetail(presetIntervals[0], null);
  }
  return accountInterval;
}
