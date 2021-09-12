import 'date-fns';
import React from 'react';
import cl from 'classnames';
import {
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Area,
  AreaChart,
} from 'recharts';
import s from './index.module.css';
import {
  getFormatter,
  getTooltipFormatter,
  ImageAxisTick,
  svgImgSize,
} from '../services';
import { getColor } from '../../../services/colors';

export default function PercentChart({
  data,
  keys = [],
  className,
  start,
  end,
  xFormat = null,
  yFormat,
  forceXToDisplay,
  xIsImage,
  tFormat = null,
  tValueFormat = null,
  tSorter = () => 1,
  xName,
  yName,
  xDomain,
  yDomain,
}) {
  if (xFormat === null) {
    xFormat = getFormatter(data.length, start, end);
  }
  if (tFormat === null) {
    tFormat = getTooltipFormatter(data, tValueFormat);
  }

  const areas = keys.map((ke, k) => (
    <Area
      key={ke}
      type="monotone"
      dataKey={ke}
      stackId={-1}
      stroke={getColor(k)}
      fill={getColor(k)}
    />
  ));

  return (
    <div className={cl(s.root, className)}>
      <ResponsiveContainer
        width="100%"
        height="100%"
      >
        <AreaChart
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
          <Tooltip
            itemSorter={tSorter}
            wrapperStyle={{ zIndex: 1000 }}
            formatter={tFormat}
          />
          {areas}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
