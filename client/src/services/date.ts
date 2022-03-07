import { IntervalDetail } from '../components/IntervalSelector/IntervalSelector';
import { ReduxIntervalDetail } from './redux/modules/user/reducer';
import { Timesplit } from './types';

export function cloneDate(date: Date) {
  return new Date(date.getTime());
}

export function startOfDay(date: Date) {
  const d = cloneDate(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfDay(date: Date) {
  const d = cloneDate(date);
  d.setHours(23, 59, 59);
  return d;
}

export function nextDay(date: Date) {
  const d = cloneDate(date);
  d.setDate(d.getDate() + 1);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getAppropriateTimesplitFromRange(start: Date, end: Date) {
  const diff = end.getTime() - start.getTime();
  const days = diff / (1000 * 60 * 60 * 24);
  if (days <= 2) {
    return Timesplit.hour;
  }
  if (days <= 60) {
    return Timesplit.day;
  }
  if (days <= 800) {
    return Timesplit.month;
  }
  return Timesplit.year;
}

export function intervalDetailToRedux(intervalDetail: IntervalDetail): ReduxIntervalDetail {
  return {
    name: intervalDetail.name,
    unit: intervalDetail.unit,
    index: intervalDetail.index,
    interval: {
      start: intervalDetail.interval.start.getTime(),
      end: intervalDetail.interval.end.getTime(),
      timesplit: intervalDetail.interval.timesplit,
    },
  };
}

export function fromReduxIntervalDetail(intervalDetail: ReduxIntervalDetail): IntervalDetail {
  return {
    name: intervalDetail.name,
    unit: intervalDetail.unit,
    index: intervalDetail.index,
    interval: {
      start: new Date(intervalDetail.interval.start),
      end: new Date(intervalDetail.interval.end),
      timesplit: intervalDetail.interval.timesplit,
    },
  };
}
