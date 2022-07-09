import { useCallback } from 'react';
import { DateId, Precision } from './types';

export const fresh = (d: Date, eraseHour = false) => {
  const date = new Date(d.getTime());
  date.setMilliseconds(0);
  date.setSeconds(0);
  date.setMinutes(0);
  if (eraseHour) {
    date.setHours(0);
  }
  return date;
};

export const buildFromDateId = (dateId: DateId) => {
  const date = fresh(new Date());
  date.setFullYear(dateId.year);
  date.setMonth((dateId.month ?? 1) - 1);
  date.setDate(dateId.day ?? 1);
  date.setHours(dateId.hour ?? 0);
  return date;
};

const getDateFromIndex = (index: number, start: Date, precision: Precision) => {
  const date = fresh(start, precision !== Precision.hour);
  if (precision === Precision.year) {
    date.setFullYear(date.getFullYear() + index);
    return date;
  }
  if (precision === Precision.month) {
    date.setMonth(date.getMonth() + index);
    return date;
  }
  if (precision === Precision.week) {
    date.setDate(date.getDate() + index * 7);
    return date;
  }
  if (precision === Precision.day) {
    date.setDate(date.getDate() + index);
    return date;
  }
  if (precision === Precision.hour) {
    date.setHours(date.getHours() + index);
    return date;
  }
  console.warn('No precision on getDateFromIndex');
  return date;
  // const ratio = index / totalIndex;
  // const date = new Date(start.getTime() + ratio * (end.getTime() - start.getTime()));
  // return date;
};

export const pad = (value: number) => value.toString().padStart(2, '0');

const getPrecisionFromDateId = (dateId: DateId) => {
  if ('hour' in dateId) {
    return Precision.hour;
  }
  if ('day' in dateId) {
    return Precision.day;
  }
  if ('month' in dateId) {
    return Precision.month;
  }
  return Precision.year;
};

export interface DateWithPrecision {
  date: Date;
  precision: Precision;
}

export interface DefaultGraphItem {
  x: number;
  dateWithPrecision: DateWithPrecision;
}

const cleanDateFromPrecision = (date: Date, precision: Precision) => {
  const d = fresh(date, true);
  if (precision === Precision.year) {
    d.setMonth(0);
    d.setDate(1);
    return d;
  }
  if (precision === Precision.month) {
    d.setDate(1);
    return d;
  }
  if (precision === Precision.week) {
    return d;
  }
  if (precision === Precision.day) {
    return d;
  }
  if (precision === Precision.hour) {
    return fresh(date, false);
  }
  console.warn('No precision on cleanDateFromPrecision');
  return date;
};

const buildXYDataWithGetters = <Dict extends Record<string, any>>(
  data: { _id: DateId; value: number }[],
  start: Date,
  end: Date,
  doNotFillData: boolean,
  getData: (index: number) => Dict,
  getDefaultData: () => Dict,
) => {
  if (data.length === 0) {
    return [];
  }
  const precision = getPrecisionFromDateId(data[0]._id);
  start = cleanDateFromPrecision(start, precision);
  end = fresh(end, precision !== Precision.hour);
  const built: (DefaultGraphItem & Dict)[] = [];
  let currentIndex = 0;
  for (let dataIndex = 0; dataIndex < data.length; dataIndex += 1) {
    const d = data[dataIndex];
    const thisDate = buildFromDateId(d._id);
    if (thisDate.getTime() < start.getTime()) {
      continue;
    }
    if (thisDate.getTime() > end.getTime()) {
      return built;
    }
    let currentDate = getDateFromIndex(currentIndex, start, precision);
    for (let i = 0; currentDate.getTime() !== thisDate.getTime(); i += 1) {
      if (currentDate.getTime() > thisDate.getTime()) {
        console.warn('Could not build missing data correctly');
        return built;
      }
      if (!doNotFillData) {
        built.push({
          x: currentIndex,
          dateWithPrecision: {
            date: currentDate,
            precision,
          },
          ...getDefaultData(),
        });
      }
      currentIndex += 1;
      currentDate = getDateFromIndex(currentIndex, start, precision);
    }
    built.push({
      x: currentIndex,
      dateWithPrecision: {
        date: getDateFromIndex(currentIndex, start, precision),
        precision,
      },
      ...getData(dataIndex),
    });
    currentIndex += 1;
  }
  if (!doNotFillData) {
    let currentDate = getDateFromIndex(currentIndex, start, precision);
    // eslint-disable-next-line no-constant-condition
    for (let i = 0; currentDate.getTime() <= end.getTime(); i += 1) {
      built.push({
        x: currentIndex + i,
        dateWithPrecision: {
          date: currentDate,
          precision,
        },
        ...getDefaultData(),
      });
      currentIndex += 1;
      currentDate = getDateFromIndex(currentIndex, start, precision);
    }
  }
  return built;
};

export const buildXYData = (
  data: { _id: DateId; value: number }[],
  start: Date,
  end: Date,
  doNotFillData?: boolean,
) =>
  buildXYDataWithGetters(
    data,
    start,
    end,
    Boolean(doNotFillData),
    idx => ({ y: data[idx].value }),
    () => ({ y: 0 }),
  );

export const buildXYDataObjSpread = (
  data: ({ _id: DateId } & any)[],
  keys: string[],
  start: Date,
  end: Date,
  doNotFillData = false,
) => {
  const zeros = keys.reduce<Record<string, number>>((acc, curr) => {
    acc[curr] = 0;
    return acc;
  }, {});
  return buildXYDataWithGetters(
    data,
    start,
    end,
    Boolean(doNotFillData),
    idx => data[idx],
    () => zeros,
  );
};

export const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const formatDateWithPrecisionToSimpleString = ({
  date,
  precision,
}: DateWithPrecision) => {
  if (precision === Precision.hour) {
    return `${pad(date.getHours())}:00`;
  }
  if (precision === Precision.day) {
    return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}`;
  }
  if (precision === Precision.week) {
    return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}`;
  }
  if (precision === Precision.month) {
    return `${months[date.getMonth()]}`;
  }
  if (precision === Precision.year) {
    return pad(date.getFullYear());
  }
  return 'no precision found';
};

export const formatDateWithPrecisionToString = ({
  date,
  precision,
}: DateWithPrecision) => {
  if (precision === Precision.hour) {
    return `${pad(date.getHours())}:00 ${pad(date.getDate())}/${pad(
      date.getMonth() + 1,
    )}/${pad(date.getFullYear())}`;
  }
  if (precision === Precision.day) {
    return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${pad(
      date.getFullYear(),
    )}`;
  }
  if (precision === Precision.week) {
    return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${pad(
      date.getFullYear(),
    )}`;
  }
  if (precision === Precision.month) {
    return `${months[date.getMonth()]} ${pad(date.getFullYear())}`;
  }
  if (precision === Precision.year) {
    return pad(date.getFullYear());
  }
  return 'no precision found';
};

export const useFormatXAxis = (data: DefaultGraphItem[]) =>
  useCallback(
    (value: number) => {
      const dataValue = data.find(d => d.x === value);
      if (!dataValue) {
        return '';
      }
      return formatDateWithPrecisionToSimpleString(dataValue.dateWithPrecision);
    },
    [data],
  );

export const formatYAxisDate = (value: number) => {
  const year = Math.floor(value);
  const month = Math.floor((value - year) * 12);
  return `${months[month]} ${year}`;
};

export const formatXAxisDateTooltip = <
  D extends { dateWithPrecision: DateWithPrecision },
>(
  label: string,
  payload: D,
) => formatDateWithPrecisionToString(payload.dateWithPrecision);

export const msToMinutes = (ms: number) => Math.floor(ms / 1000 / 60);
export const msToMinutesAndSeconds = (ms: number) =>
  `${msToMinutes(ms)}:${pad(
    Math.floor((ms - msToMinutes(ms) * 1000 * 60) / 1000),
  )}`;

export const dateToListenedAt = (date: Date) => {
  const now = new Date();
  const day = 1000 * 60 * 60 * 24;
  const diff = now.getTime() - date.getTime();
  if (diff < day) {
    return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${pad(
    date.getFullYear(),
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
  if (old === 0) {
    return 100;
  }
  if (now === 0) {
    return -100;
  }
  if (now > old) {
    return Math.floor((now / old - 1) * 100);
  }
  return -(1 - Math.floor(old / now));
};

export const dateToMonthAndYear = (date: Date) =>
  `${months[date.getMonth()]} ${date.getFullYear()}`;
