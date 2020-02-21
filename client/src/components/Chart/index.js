import 'date-fns';
import React from 'react';
import {
  FlexibleXYPlot,
  XAxis,
  YAxis,
  LineSeries,
  VerticalBarSeries,
  Crosshair,
} from 'react-vis';
import cl from 'classnames';
import s from './index.module.css';
import IntervalModifier from '../IntervalModifier';

const padDate = (value) => (`${value}`).padStart(2, '0');

const getPrecision = (start, end) => {
  const diff = end.getTime() - start.getTime();
  const day = 1000 * 60 * 60 * 24;

  if (diff < day * 2) return 'hour';
  if (diff <= day * 31 * 2) return 'day';
  if (diff <= day * 31 * 12 * 2) return 'month';
  return 'year';
};

const getFormatter = (arrayLength, start, end) => {
  const diff = end.getTime() - start.getTime();
  const precision = getPrecision(start, end);

  return value => {
    const ratio = value / (arrayLength - 1);
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
  yFormat,
  onStartChange = () => { },
  onEndChange = () => { },
  xName,
  yName,
  type = 'line', // || bar
}) {
  const length = data.length;
  let tickValues = undefined;
  const nbTick = 10;

  if (xFormat === null) {
    xFormat = getFormatter(data.length, start, end);

    if (length < nbTick) {
      tickValues = undefined;
    } else {
      tickValues = [];
      for (let i = 0; i < nbTick; i++) {
        const idx = Math.floor(i / nbTick * (length - 1));
        tickValues.push(data[idx].x);
      }
    }
  }


  const getLine = () => {
    switch (type) {
      case 'line':
        return (
          <LineSeries
            curve="curveMonotoneX"
            data={data}
            strokeWidth={3}
          />
        );
      case 'bar':
        return (
          <VerticalBarSeries
            data={data}
          />
        );
    }
  }

  return (
    <div className={cl(s.root, className)}>
      <FlexibleXYPlot
        margin={{ left: 50 }}
        xType='ordinal'
        style={{
          width: '100%',
        }}
      >
        <XAxis
          tickValues={tickValues}
          title={xName}
          tickFormat={xFormat}
        />
        <YAxis
          tickFormat={yFormat}
          title={yName}
        />
        {
          getLine()
        }
      </FlexibleXYPlot>
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
