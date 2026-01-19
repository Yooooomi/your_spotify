import { useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { startOfDay, startOfMonth, startOfWeek, startOfYear } from "date-fns";
import { getAppropriateTimesplitFromRange } from "./date";
import { selectAccounts } from "./redux/modules/admin/selector";
import { selectUser } from "./redux/modules/user/selector";
import { getMinOfArray } from "./tools";
import { Timesplit } from "./types";
import { getFirstListenedAt } from "./user";

const now = new Date();
const startOfToday = startOfDay(now);
const startOfThisWeek = startOfWeek(now);
const startOfThisMonth = startOfMonth(now);
const startOfThisYear = startOfYear(now);

export interface Interval {
  timesplit: Timesplit;
  start: Date;
  end: Date;
}

export interface PresetIntervalDetail {
  type: "preset";
  name: string;
  unit: string;
  interval: Interval;
}

export interface CustomIntervalDetail {
  type: "custom";
  name: "custom";
  interval: Interval;
}

export interface UserBasedIntervalDetails {
  type: "userbased";
  name: string;
  interval: (user: { firstListenedAt: string } | null) => Interval;
}

export type IntervalDetail =
  | PresetIntervalDetail
  | CustomIntervalDetail
  | UserBasedIntervalDetails;

export type RawIntervalDetail = {
  type: IntervalDetail["type"];
  name: string;
  interval: Interval;
  unit: string;
};

export const presetIntervals = [
  {
    type: "preset",
    name: "Today",
    unit: "day",
    interval: { timesplit: Timesplit.hour, start: startOfToday, end: now },
  },
  {
    type: "preset",
    name: "This week",
    unit: "week",
    interval: { timesplit: Timesplit.day, start: startOfThisWeek, end: now },
  },
  {
    type: "preset",
    name: "This month",
    unit: "month",
    interval: { timesplit: Timesplit.day, start: startOfThisMonth, end: now },
  },
  {
    type: "preset",
    name: "This year",
    unit: "year",
    interval: { timesplit: Timesplit.month, start: startOfThisYear, end: now },
  },
] as const satisfies PresetIntervalDetail[];

export const userBasedIntervals: UserBasedIntervalDetails[] = [
  {
    type: "userbased",
    name: "All",
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
  user: { firstListenedAt: string } | undefined,
): RawIntervalDetail {
  if (detail.type === "preset") {
    return {
      name: detail.name,
      type: "preset",
      interval: detail.interval,
      unit: detail.unit,
    };
  }
  if (detail.type === "userbased") {
    return {
      name: detail.name,
      type: "userbased",
      interval: detail.interval(user ?? null),
      unit: "period",
    };
  }
  return {
    name: detail.name,
    type: "custom",
    interval: detail.interval,
    unit: "period",
  };
}

export function detailIntervalToQuery(
  interval: IntervalDetail,
  prefix: string,
) {
  if (interval.type === "custom") {
    return {
      [`${prefix}type`]: "custom",
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
    if (type === "custom" && start && end) {
      const dateStart = new Date(start);
      const dateEnd = new Date(end);
      const timesplit = getAppropriateTimesplitFromRange(dateStart, dateEnd);
      return {
        type: "custom",
        name: "custom",
        interval: { start: dateStart, end: dateEnd, timesplit },
      };
    }
    if (name) {
      toReturn = optimisticGetIntervalDetailFromName(decodeURIComponent(name));
    }
  } catch {
    // Do nothing
  }
  return toReturn ?? presetIntervals[0];
}

export function useQueryToRawIntervalDetail(prefix: string) {
  const [query] = useSearchParams();
  const user = useSelector(selectUser);
  return getRawIntervalDetail(
        queryToIntervalDetail(query, prefix),
        user ?? undefined,
      );
}

export function useOldestListenedAtFromUsers(
  userIds: string[],
  prefix: string,
): RawIntervalDetail {
  const user = useSelector(selectUser);
  const users = useSelector(selectAccounts);
  const [query] = useSearchParams();

  const detail = queryToIntervalDetail(query, prefix);

  const filtered = users.filter(us => [user?._id, ...userIds].includes(us.id));
  const mins = getMinOfArray(filtered, item =>
    new Date(item.firstListenedAt).getTime(),
  );
  const account = filtered[mins?.minIndex ?? 0];
  const accountInterval = getRawIntervalDetail(detail, account);

  if (!account && detail.type === "userbased") {
    return getRawIntervalDetail(presetIntervals[0], undefined);
  }
  return accountInterval;
}