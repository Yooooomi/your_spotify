import React, { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { api } from '../../../services/api';
import { useAPI } from '../../../services/hooks';
import Bar from '../../charts/Bar';
import { ImplementedChartProps } from '../types';
import ChartCard from '../../ChartCard';
import LoadingImplementedChart from '../LoadingImplementedChart';
import { selectRawIntervalDetail } from '../../../services/redux/modules/user/selector';

interface ListeningRepartitionProps extends ImplementedChartProps {}

const formatXAxis = (value: any) => `${value}:00`;

const formatYAxis = (value: any) => `${value}%`;

const formatXTooltip = (label: string) => `${label}:00`;

export default function ListeningRepartition({
  className,
}: ListeningRepartitionProps) {
  const { interval } = useSelector(selectRawIntervalDetail);
  const result = useAPI(api.timePerHourOfDay, interval.start, interval.end);

  const total = useMemo(
    () => result?.reduce((acc, curr) => acc + curr.count, 0) ?? 0,
    [result],
  );
  const data = useMemo(
    () =>
      Array.from(Array(24).keys()).map(i => {
        const dataValue = result?.find(r => r._id === i);
        if (!dataValue) {
          return {
            x: i,
            y: 0,
            count: 0,
          };
        }
        return {
          x: i,
          y: Math.floor((dataValue.count / total) * 1000) / 10,
          count: dataValue.count,
        };
      }),
    [result, total],
  );

  const formatYTooltip = useCallback(
    (a: any, b: any, c: any) => (
      <div>
        {`${a}% of your daily listening`}
        <br />
        {`${c.payload.count} out of ${total} songs`}
      </div>
    ),
    [total],
  );

  if (!result) {
    return (
      <LoadingImplementedChart
        className={className}
        title="Listening distribution over day"
      />
    );
  }

  return (
    <ChartCard className={className} title="Listening distribution over day">
      <Bar
        data={data}
        xFormat={formatXAxis}
        yFormat={formatYAxis}
        tooltipLabelFormatter={formatXTooltip}
        tooltipValueFormatter={formatYTooltip}
      />
    </ChartCard>
  );
}
