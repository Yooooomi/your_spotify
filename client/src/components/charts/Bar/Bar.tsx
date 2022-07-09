import React, { useMemo } from 'react';
import {
  BarChart,
  XAxis,
  Bar as RBar,
  Tooltip,
  YAxis,
  ResponsiveContainer,
} from 'recharts';

interface BarProps {
  data: {
    x: number | string;
    y: number;
  }[];
  customXTick?: React.ComponentProps<typeof XAxis>['tick'];
  xFormat?: React.ComponentProps<typeof XAxis>['tickFormatter'];
  yFormat?: React.ComponentProps<typeof YAxis>['tickFormatter'];
  tooltipLabelFormatter?: React.ComponentProps<
    typeof Tooltip
  >['labelFormatter'];
  tooltipValueFormatter?: React.ComponentProps<typeof Tooltip>['formatter'];
}

export default function Bar({
  data,
  xFormat,
  yFormat,
  tooltipLabelFormatter,
  tooltipValueFormatter,
  customXTick,
}: BarProps) {
  const realFormatter = useMemo(() => {
    if (tooltipValueFormatter) {
      return (...args: any[]) => [tooltipValueFormatter(...args), null];
    }
    return undefined;
  }, [tooltipValueFormatter]);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <XAxis
          dataKey="x"
          tickFormatter={xFormat}
          tick={customXTick}
          style={{ fontWeight: 'bold' }}
        />
        <YAxis dataKey="y" tickFormatter={yFormat} width={40} />
        <RBar dataKey="y" fill="var(--primary)" />
        <Tooltip
          wrapperStyle={{ zIndex: 10 }}
          contentStyle={{ backgroundColor: 'var(--background)' }}
          labelStyle={{ color: 'var(--text-on-light)' }}
          labelFormatter={tooltipLabelFormatter}
          formatter={realFormatter}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
