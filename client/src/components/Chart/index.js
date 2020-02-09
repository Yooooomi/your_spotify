import 'date-fns';
import React from 'react';
import {
  FlexibleWidthXYPlot,
  XAxis,
  YAxis,
  LineSeries,
} from 'react-vis';
import cl from 'classnames';
import s from './index.module.css';
import IntervalModifier from '../IntervalModifier';

const padDate = (value) => (`${value}`).padStart(2, '0');

const getPrecision = (start, end) => {
  const diff = end.getTime() - start.getTime();
  const day = 1000 * 60 * 60 * 24;

  if (diff < day * 2) return 'hour';
  if (diff <= day * 31) return 'day';
  if (diff <= day * 31 * 12) return 'month';
  return 'year';
};

const getFormatter = (arrayLength, start, end) => {
  const diff = end.getTime() - start.getTime();
  const precision = getPrecision(start, end);

  return value => {
    const ratio = value / arrayLength;
    const current = new Date(start.getTime() + diff * ratio);

    if (precision === 'hour') return `${padDate(current.getHours())}h`;
    if (precision === 'day') return `${padDate(current.getDate())}/${padDate(current.getMonth() + 1)}`;
    if (precision === 'month') return `${padDate(current.getMonth() + 1)}/${current.getFullYear()}`;
    if (precision === 'year') return `${current.getFullYear()}`;
    return 'NO PRECISION';
  };
};

export default function Chart({
  data,
  className,
  start,
  end,
  timeSplit,
  onTimeSplitChange,
  xFormat = null,
  onStartChange = () => { },
  onEndChange = () => { },
  xName,
  yName,
}) {
  if (xFormat === null) {
    xFormat = getFormatter(data.length, start, end);
  }

  return (
    <div className={cl(s.root, className)}>
      <FlexibleWidthXYPlot
        style={{
          width: '100%',
        }}
        height={300}
      >
        <XAxis
          title={xName}
          tickFormat={xFormat}
        />
        <YAxis
          title={yName}
        />
        <LineSeries
          curve="curveMonotoneX"
          data={data}
        />
      </FlexibleWidthXYPlot>
      <div className={s.buttons}>
      <IntervalModifier
              start={start}
              end={end}
              timeSplit={timeSplit}
              onStartChange={onStartChange}
              onEndChange={onEndChange}
              onTimeSplitChange={onTimeSplitChange}
            />
      </div>
    </div>
  );
}
