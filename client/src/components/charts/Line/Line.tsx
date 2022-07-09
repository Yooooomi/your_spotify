import React from 'react';
import {
  LineChart,
  Line as RLine,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import {
  useRawTooltipLabelFormatter,
  useRawTooltipValueFormatter,
} from '../../../services/chart';
import { DateWithPrecision } from '../../../services/stats';

interface LineProps<
  D extends { x: number; y: number; dateWithPrecision: DateWithPrecision },
> {
  data: D[];
  xFormat?: React.ComponentProps<typeof XAxis>['tickFormatter'];
  yFormat?: React.ComponentProps<typeof YAxis>['tickFormatter'];
  tooltipLabelFormatter?: (value: string, payload: D) => string;
  tooltipValueFormatter?: (value: number, payload: D) => string;
}

export default function Line<
  D extends { x: number; y: number; dateWithPrecision: DateWithPrecision },
>({
  data,
  xFormat,
  yFormat,
  tooltipLabelFormatter,
  tooltipValueFormatter,
}: LineProps<D>) {
  const internTooltipLabelFormatter = useRawTooltipLabelFormatter(
    tooltipLabelFormatter,
  );
  const internTooltipValueFormatter = useRawTooltipValueFormatter(
    tooltipValueFormatter,
  );

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <RLine
          connectNulls
          type="monotone"
          dataKey="y"
          fill="var(--primary)"
          stroke="var(--primary)"
          strokeWidth={2}
          dot={false}
        />
        <XAxis
          name="X"
          domain={['dataMin', 'dataMax']}
          dataKey="x"
          tickFormatter={xFormat}
          style={{ fontWeight: 'bold' }}
        />
        <YAxis domain={['dataMin', 'dataMax']} tickFormatter={yFormat} />
        <Tooltip
          wrapperStyle={{ zIndex: 10 }}
          contentStyle={{ backgroundColor: 'var(--background)' }}
          labelStyle={{ color: 'var(--text-on-light)' }}
          labelFormatter={internTooltipLabelFormatter}
          formatter={internTooltipValueFormatter}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
