import 'date-fns';
import React from 'react';
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
import s from './index.module.css';
import {
  getFormatter,
  getPrecisionIndex,
  getTooltipFormatter,
  ImageAxisTick,
  svgImgSize,
} from '../services';

export default function SimpleLineChart({
  data,
  className,
  start,
  end,
  xFormat = null,
  yFormat,
  forceXToDisplay,
  xIsImage,
  tFormat = null,
  tValueFormat = null,
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
    tFormat = getTooltipFormatter(data, tValueFormat, getPrecisionIndex(start, end));
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
      <ResponsiveContainer
        style={{ width: '100%', height: '100%' }}
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
            dataKey="x"
            height={xIsImage ? svgImgSize + 15 : undefined}
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
            dataKey="y"
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
