import React, { useMemo } from 'react';
import {
  BarChart,
  XAxis,
  Bar as RBar,
  Tooltip,
  YAxis,
  ResponsiveContainer,
} from 'recharts';
import { getColor } from '../../../services/colors';

export interface StackedBarProps {
  data: ({
    x: number | string;
  } & { [o: string]: number })[];
  customXTick?: React.ComponentProps<typeof XAxis>['tick'];
  xFormat?: React.ComponentProps<typeof XAxis>['tickFormatter'];
  yFormat?: React.ComponentProps<typeof YAxis>['tickFormatter'];
  tooltipLabelFormatter?: React.ComponentProps<
    typeof Tooltip
  >['labelFormatter'];
  tooltipValueFormatter?: React.ComponentProps<typeof Tooltip>['formatter'];
  tooltipItemSorter?: React.ComponentProps<typeof Tooltip>['itemSorter'];
}

export default function Bar({
  data,
  xFormat,
  yFormat,
  tooltipLabelFormatter,
  tooltipValueFormatter,
  tooltipItemSorter,
  customXTick,
}: StackedBarProps) {
  const realFormatter = useMemo(() => {
    if (tooltipValueFormatter) {
      return (...args: any[]) => [tooltipValueFormatter(...args), null];
    }
    return undefined;
  }, [tooltipValueFormatter]);

  const allKeys = useMemo(
    () =>
      data.reduce<Set<string>>((acc, curr) => {
        Object.keys(curr)
          .filter(key => key !== 'x')
          .forEach(key => acc.add(key));
        return acc;
      }, new Set()),
    [data],
  );

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <XAxis
          dataKey="x"
          tickFormatter={xFormat}
          tick={customXTick}
          style={{ fontWeight: 'bold' }}
        />
        <YAxis tickFormatter={yFormat} width={40} />
        {Array.from(allKeys).map((k, index) => (
          <RBar key={k} stackId="only" dataKey={k} fill={getColor(index)} />
        ))}
        <Tooltip
          wrapperStyle={{ zIndex: 10 }}
          contentStyle={{ backgroundColor: 'var(--background)' }}
          labelStyle={{ color: 'var(--text-on-light)' }}
          labelFormatter={tooltipLabelFormatter}
          formatter={realFormatter}
          itemSorter={tooltipItemSorter}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
