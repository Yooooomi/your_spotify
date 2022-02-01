import { useCallback } from "react";
import { DateId, Precision } from "./types";

const fresh = (d: Date) => {
  const date = new Date(d.getTime());
  date.setMilliseconds(0);
  date.setSeconds(0);
  date.setMinutes(0);
  return date;
};

export const buildFromDateId = (dateId: DateId) => {
  const date = fresh(new Date());
  date.setFullYear(dateId.year);
  date.setMonth((dateId.month ?? 1) - 1);
  date.setDate(dateId.day ?? 0);
  date.setHours(dateId.hour ?? 0);
  return date;
};

const getHours = (date: Date) => date.getTime() / 1000 / 60 / 60;
const getDays = (date: Date) => date.getTime() / 1000 / 60 / 60 / 24;
const getMonths = (date: Date) => date.getTime() / 1000 / 60 / 60 / 24 / 30;
const getYears = (date: Date) =>
  date.getTime() / 1000 / 60 / 60 / 24 / 30 / 365;

const countIndexes = (start: Date, targetId: DateId) => {
  const target = buildFromDateId(targetId);
  if ("hour" in targetId) {
    return getHours(target) - getHours(start);
  }
  if ("day" in targetId) {
    return getDays(target) - getDays(start);
  }
  if ("month" in targetId) {
    return getMonths(target) - getMonths(start);
  }
  return getYears(target) - getYears(start);
};

const countTotalIndexes = (precision: Precision, start: Date, end: Date) => {
  if (precision === Precision.hour) {
    return getHours(end) - getHours(start);
  }
  if (precision === Precision.day) {
    return getDays(end) - getDays(start);
  }
  if (precision === Precision.month) {
    return getMonths(end) - getMonths(start);
  }
  return getYears(end) - getYears(start);
};

const getDateFromIndex = (
  index: number,
  totalIndex: number,
  start: Date,
  end: Date
) => {
  const ratio = index / totalIndex;
  const date = new Date(
    start.getTime() + ratio * (end.getTime() - start.getTime())
  );
  return date;
};

const pad = (value: number) => value.toString().padStart(2, "0");

const getStringFromDateAndInterval = (date: Date, start: Date, end: Date) => {
  const days = (end.getTime() - start.getTime()) / 1000 / 60 / 60 / 24;
  if (days <= 1) {
    return `${pad(date.getHours())}:00`;
  }
  if (days < 365) {
    return `${pad(date.getDay())}/${pad(date.getMonth() + 1)}`;
  }
  return `${pad(date.getMonth() + 1)}/${pad(date.getFullYear())}`;
};

const getPrecisionFromDateId = (dateId: DateId) => {
  if ("hour" in dateId) {
    return Precision.hour;
  }
  if ("day" in dateId) {
    return Precision.day;
  }
  if ("month" in dateId) {
    return Precision.month;
  }
  return Precision.year;
};

export const buildXYData = (
  data: { _id: DateId; value: number }[],
  start: Date,
  end: Date,
  doNotFillData = false
) => {
  start = fresh(start);
  end = fresh(end);
  if (data.length === 0) {
    return [];
  }
  const precision = getPrecisionFromDateId(data[0]._id);
  const built: { x: number; y: number; date: Date }[] = [];
  const totalIndex = countTotalIndexes(precision, start, end);
  data.forEach((d) => {
    const nextIndex = Math.floor(countIndexes(start, d._id));
    if (!doNotFillData) {
      const currentIndex = built.length;
      const diff = nextIndex - currentIndex;
      for (let i = 0; i < diff; i += 1) {
        built.push({
          x: currentIndex + i,
          y: 0,
          date: getDateFromIndex(currentIndex + i, totalIndex, start, end),
        });
      }
    }
    built.push({
      x: nextIndex,
      y: d.value,
      date: getDateFromIndex(nextIndex, totalIndex, start, end),
    });
  });
  if (!doNotFillData) {
    const nextIndex = totalIndex - 1;
    const currentIndex = built.length;
    const diff = nextIndex - currentIndex;
    for (let i = 0; i < diff; i += 1) {
      built.push({
        x: currentIndex + i,
        y: 0,
        date: getDateFromIndex(currentIndex + i, totalIndex, start, end),
      });
    }
  }
  return built;
};

export const useFormatXAxis = (
  data: { x: number; y: number; date: Date }[],
  start: Date,
  end: Date
) =>
  useCallback(
    (value: number, index: number) => {
      const dataValue = data.find((d) => d.x === value);
      if (!dataValue) {
        return "";
      }
      return getStringFromDateAndInterval(dataValue.date, start, end);
    },
    [data, end, start]
  );

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const formatYAxisDate = (value: number) => {
  const year = Math.floor(value);
  const month = Math.floor((value - year) * 12);
  return `${months[month]} ${year}`;
};

export const formatDateToString = (date: Date) => {
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${pad(
    date.getFullYear()
  )}`;
};

export const formatXAxisDateTooltip = <D extends { date: Date }>(
  label: string,
  payload: D
) => formatDateToString(payload.date);

export const msToMinutes = (ms: number) => Math.floor(ms / 1000 / 60);
export const msToMinutesAndSeconds = (ms: number) =>
  `${msToMinutes(ms)}:${pad(
    Math.floor((ms - msToMinutes(ms) * 1000 * 60) / 1000)
  )}`;

export const dateToListenedAt = (date: Date) => {
  const now = new Date();
  const day = 1000 * 60 * 60 * 24;
  const diff = now.getTime() - date.getTime();
  if (diff < day) {
    return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${pad(
    date.getFullYear()
  )} at ${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export const getLastPeriod = (start: Date, end: Date) => {
  const diff = end.getTime() - start.getTime();
  const oldStart = new Date(start.getTime() - diff);
  const oldEnd = new Date(end.getTime() - diff);
  return { start: oldStart, end: oldEnd };
};

export const getPercentMore = (old: number, now: number) => {
  if (old === now) return 0;
  if (old < now) {
    return Math.floor((now / old) * 100);
  }
  return -Math.floor(old / now);
};

export const dateToMonthAndYear = (date: Date) => {
  return `${months[date.getMonth()]} ${date.getFullYear()}`;
};
