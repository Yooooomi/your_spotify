import { useCallback } from "react";
import { TitleFormatter, ValueFormatter } from "../components/Tooltip/Tooltip";
import { DateId, Precision } from "./types";
import { DateFormatter } from "./date";

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
  const date = fresh(
    new Date(
      dateId.year,
      (dateId.month ?? 1) - 1,
      dateId.day ?? 1,
      dateId.hour ?? 0,
    ),
  );
  return date;
};

export const getDateFromIndex = (
  index: number,
  start: Date,
  precision: Precision,
) => {
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
  console.warn("No precision on getDateFromIndex");
  return date;
  // const ratio = index / totalIndex;
  // const date = new Date(start.getTime() + ratio * (end.getTime() - start.getTime()));
  // return date;
};

export const pad = (value: number) => value.toString().padStart(2, "0");

export const getPrecisionFromDateId = (dateId: DateId) => {
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
  console.warn("No precision on cleanDateFromPrecision");
  return date;
};

const buildXYDataWithGetters = <Dict extends Record<string, any>>(
  data: { _id: DateId }[],
  start: Date,
  end: Date,
  doNotFillData: boolean,
  getData: (index: number) => Dict,
  getDefaultData: () => Dict,
) => {
  if (data.length === 0) {
    return [];
  }
  const precision = getPrecisionFromDateId(data[0]!._id);
  start = cleanDateFromPrecision(start, precision);
  end = fresh(end, precision !== Precision.hour);
  const built: (DefaultGraphItem & Dict)[] = [];
  let currentIndex = 0;
  for (let dataIndex = 0; dataIndex < data.length; dataIndex += 1) {
    const d = data[dataIndex]!;
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
        console.warn("Could not build missing data correctly");
        return built;
      }
      if (!doNotFillData) {
        built.push({
          ...getDefaultData(),
          x: currentIndex,
          dateWithPrecision: {
            date: currentDate,
            precision,
          },
        });
      }
      currentIndex += 1;
      currentDate = getDateFromIndex(currentIndex, start, precision);
    }
    built.push({
      ...getData(dataIndex),
      x: currentIndex,
      dateWithPrecision: {
        date: getDateFromIndex(currentIndex, start, precision),
        precision,
      },
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
    idx => ({ y: data[idx]!.value }),
    () => ({ y: 0 }),
  );

export const buildXYDataObjSpread = <D extends { _id: DateId }>(
  data: D[],
  keys: string[],
  start: Date,
  end: Date,
  doNotFillData = false,
) => {
  const zeros = keys.reduce<Record<string, any>>((acc, curr) => {
    acc[curr] = 0;
    return acc;
  }, {});
  return buildXYDataWithGetters(
    data,
    start,
    end,
    Boolean(doNotFillData),
    idx => data[idx]!,
    () => zeros,
  );
};

export const formatDateWithPrecisionToSimpleString = ({
  date,
  precision,
}: DateWithPrecision) => {
  if (precision === Precision.hour) {
    return DateFormatter.toHour(date);
  }
  if (precision === Precision.day) {
    return DateFormatter.toDayMonth(date);
  }
  if (precision === Precision.week) {
    return DateFormatter.toDayMonth(date);
  }
  if (precision === Precision.month) {
    return DateFormatter.toMonthString(date);
  }
  if (precision === Precision.year) {
    return DateFormatter.toYear(date);
  }
  return "no precision found";
};

export const formatDateWithPrecisionToString = ({
  date,
  precision,
}: DateWithPrecision) => {
  if (precision === Precision.hour) {
    return DateFormatter.toHourDayMonthYear(date);
  }
  if (precision === Precision.day) {
    return DateFormatter.toDayMonthYear(date);
  }
  if (precision === Precision.week) {
    return DateFormatter.toDayMonthYear(date);
  }
  if (precision === Precision.month) {
    return DateFormatter.toMonthStringYear(date);
  }
  if (precision === Precision.year) {
    return DateFormatter.toYear(date);
  }
  return "no precision found";
};

export const useFormatXAxis = (data: DefaultGraphItem[]) =>
  useCallback(
    (value: number) => {
      const dataValue = data.find(d => d.x === value);
      if (!dataValue) {
        return "";
      }
      return formatDateWithPrecisionToSimpleString(dataValue.dateWithPrecision);
    },
    [data],
  );

export function simpleTooltipValue(
  prefix = "",
  suffix = "",
): ValueFormatter<any> {
  return (_, value) =>
    `${prefix.length > 0 ? `${prefix} ` : ""}${value} ${suffix}`;
}

export const formatYAxisDate = (value: number) => {
  const year = Math.floor(value);
  const month = Math.floor((value - year) * 12);
  const d = new Date();
  d.setMonth(month);
  d.setFullYear(year);
  return DateFormatter.toMonthStringYear(d);
};

export const formatYAxisDateTooltip: ValueFormatter<unknown[]> = (_, value) =>
  formatYAxisDate(value);

export const formatXAxisDateTooltip: TitleFormatter<
  {
    dateWithPrecision: DateWithPrecision;
  }[]
> = (_, payload) => formatDateWithPrecisionToString(payload.dateWithPrecision);

export const msToMinutes = (ms: number) => Math.floor(ms / 1000 / 60);
export const msToMinutesAndSeconds = (ms: number) =>
  `${msToMinutes(ms)}:${pad(
    Math.floor((ms - msToMinutes(ms) * 1000 * 60) / 1000),
  )}`;

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
