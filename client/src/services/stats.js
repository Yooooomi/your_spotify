const getWeek = (date) => {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
};

const addTimesplit = (date, timeSplit, multiplier = 1) => {
  if (timeSplit === 'hour') date.setHours(date.getHours() + 1 * multiplier);
  else if (timeSplit === 'day') date.setDate(date.getDate() + 1 * multiplier);
  else if (timeSplit === 'week') date.setDate(date.getDate() + 7 * multiplier);
  else if (timeSplit === 'month') date.setMonth(date.getMonth() + 1 * multiplier);
  else if (timeSplit === 'year') date.setFullYear(date.getFullYear() + 1 * multiplier);
  return date;
};

const isGoodValue = (stat, date, timeSplit) => {
  const datas = {
    hour: date.getHours(),
    day: date.getDate(),
    week: getWeek(date),
    month: date.getMonth() + 1,
    year: date.getFullYear(),
  };

  // eslint-disable-next-line max-len
  if (timeSplit === 'hour') return stat.year === datas.year && stat.month === datas.month && stat.day === datas.day && stat.hour === datas.hour;
  if (timeSplit === 'day') return stat.year === datas.year && stat.month === datas.month && stat.day === datas.day;
  if (timeSplit === 'week') return stat.year === datas.year && stat.week === datas.week;
  if (timeSplit === 'month') return stat.year === datas.year && stat.month === datas.month;
  if (timeSplit === 'year') return stat.year === datas.year;
  return false;
};

export const FillModes = {
  ASK: 1,
  PREVIOUS_VALUE: 2,
  VOID: 3,
};

export const Timesplits = {
  ALL: 'all',
  HOUR: 'hour',
  DAY: 'day',
  WEEK: 'week',
  MONTH: 'month',
  YEAR: 'year',
};

export const fillArray = (stats, start, end, timeSplit, dataGetter, fillMode) => {
  const values = [];
  let tmp = new Date(start.getTime());
  let index = 0;

  while (tmp.getTime() < end.getTime()) {
    const fetched = index < stats.length && isGoodValue(stats[index]._id, tmp, timeSplit);

    if (fetched) {
      values.push({ data: dataGetter(stats[index], index), _id: new Date(tmp.getTime()) });
      index += 1;
    } else if (fillMode === FillModes.ASK) {
      values.push({ data: dataGetter(null, index), _id: new Date(tmp.getTime()) });
    } else if (fillMode === FillModes.PREVIOUS_VALUE) {
      const value = stats[index - 1] === undefined ? null : stats[index - 1];
      values.push({ data: dataGetter(value, index - 1), _id: new Date(tmp.getTime()) });
    } else if (fillMode === FillModes.VOID) {
      values.push({ data: null, _id: new Date(tmp.getTime()) });
    }
    tmp = addTimesplit(tmp, timeSplit);
  }
  return values;
};
