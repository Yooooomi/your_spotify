import 'date-fns';
import React, { PureComponent } from 'react';
import cl from 'classnames';
import {
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  BarChart,
  Bar,
} from 'recharts';
import { Tooltip as MTooltip } from '@material-ui/core';
import s from './index.module.css';
import IntervalModifier from '../IntervalModifier';
import { formatDate } from '../../services/date';

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

const getTooltipFormatter = (data, valueFormat) => (value, name, props) => {
  const finalValue = valueFormat ? valueFormat(value) : Math.round(value * 10) / 10;
  return [finalValue, formatDate(props.payload.date)];
};

const imgSize = 32;
class ImageAxisTick extends PureComponent {
  render() {
    const {
      x, y, stroke, xFormat, payload,
    } = this.props;

    const { name, url } = xFormat ? xFormat(payload.value, payload.name, this.props) : payload.value;

    return (
      <MTooltip title={name}>
        <g transform={`translate(${x - imgSize / 2},${y})`}>
          <clipPath id="yoyo">
            <circle r={imgSize / 2} cx={imgSize / 2} cy={imgSize / 2} />
          </clipPath>
          <image width={imgSize} height={imgSize} href={url} clipPath="url(#yoyo)" />
        </g>
      </MTooltip>
    );
  }
}

export default function Chart({
  data,
  className,
  start,
  end,
  timeSplit,
  onTimeSplitChange,
  xFormat = null,
  yFormat,
  forceXToDisplay,
  xIsImage,
  tFormat = null,
  tValueFormat = null,
  onStartChange = () => { },
  onEndChange = () => { },
  xName,
  yName,
  xDomain,
  yDomain,
  type = 'line', // || bar
}) {
  if (xFormat === null) {
    xFormat = getFormatter(data.length, start, end);
  }
  if (tFormat === null) {
    tFormat = getTooltipFormatter(data, tValueFormat);
  }

  let Container;
  let Data;

  if (type === 'line') {
    Container = LineChart;
    Data = Line;
  } else if (type === 'bar') {
    Container = BarChart;
    Data = Bar;
  }

  return (
    <div className={cl(s.root, className)}>
      <IntervalModifier
        autoAbsolute
        start={start}
        end={end}
        timeSplit={timeSplit}
        onStartChange={onStartChange}
        onEndChange={onEndChange}
        onTimeSplitChange={onTimeSplitChange}
      />
      <ResponsiveContainer
        style={{ width: '100%' }}
      >
        <Container
          margin={{
            bottom: 0, top: 0, left: 0, right: 0,
          }}
          data={data}
        >
          <XAxis
            minTickGap={forceXToDisplay ? -1000 : 5}
            name={xName}
            domain={xDomain}
            dataKey={'x'}
            height={xIsImage ? imgSize + 15 : undefined}
            tickFormatter={xIsImage ? undefined : xFormat}
            tick={xIsImage ? <ImageAxisTick xFormat={xFormat} /> : undefined}
          />
          <YAxis
            name={yName}
            tickFormatter={yFormat}
            domain={yDomain}
          />
          {tFormat && (
            <Tooltip
              formatter={tFormat}
            />
          )}
          <Data
            dot={false}
            strokeWidth={3}
            connectNulls
            type="monotone"
            dataKey={'y'}
            fill="#3182BD"
          />
        </Container>
      </ResponsiveContainer>
    </div>
  );

  // const length = data.length;
  // let tickValues = undefined;
  // const nbTick = 10;

  // if (xFormat === null) {
  //   xFormat = getFormatter(data.length, start, end);

  //   if (length < nbTick) {
  //     tickValues = undefined;
  //   } else {
  //     tickValues = [];
  //     for (let i = 0; i < nbTick; i++) {
  //       const idx = Math.floor(i / nbTick * (length - 1));
  //       tickValues.push(data[idx].x);
  //     }
  //   }
  // }


  // const getLine = () => {
  //   switch (type) {
  //     case 'line':
  //       return (
  //         <LineSeries
  //           curve="curveMonotoneX"
  //           data={data}
  //           strokeWidth={3}
  //         />
  //       );
  //     case 'bar':
  //       return (
  //         <VerticalBarSeries
  //           data={data}
  //         />
  //       );
  //   }
  // }

  // return (
  //   <div className={cl(s.root, className)}>
  //     <FlexibleXYPlot
  //       margin={{ left: 50 }}
  //       xType='ordinal'
  //       style={{
  //         width: '100%',
  //       }}
  //     >
  //       <XAxis
  //         tickValues={tickValues}
  //         title={xName}
  //         tickFormat={xFormat}
  //       />
  //       <YAxis
  //         tickFormat={yFormat}
  //         title={yName}
  //       />
  //       {
  //         getLine()
  //       }
  //     </FlexibleXYPlot>
  //     <div className={s.buttons}>
  //       <IntervalModifier
  //         start={start}
  //         end={end}
  //         timeSplit={timeSplit}
  //         onStartChange={onStartChange}
  //         onEndChange={onEndChange}
  //         onTimeSplitChange={onTimeSplitChange}
  //       />
  //     </div>
  //   </div>
  // );
}
