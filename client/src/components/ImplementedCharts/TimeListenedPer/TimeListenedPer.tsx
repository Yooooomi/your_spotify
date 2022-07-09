import React, { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { api } from '../../../services/api';
import { useAPI } from '../../../services/hooks';
import {
  buildXYData,
  formatXAxisDateTooltip,
  msToMinutes,
  useFormatXAxis,
} from '../../../services/stats';
import { DateId } from '../../../services/types';
import Line from '../../charts/Line';
import ChartCard from '../../ChartCard';
import LoadingImplementedChart from '../LoadingImplementedChart';
import { ImplementedChartProps } from '../types';
import { selectRawIntervalDetail } from '../../../services/redux/modules/user/selector';

interface TimeListenedPerProps extends ImplementedChartProps {}

export default function TimeListenedPer({ className }: TimeListenedPerProps) {
  const { interval } = useSelector(selectRawIntervalDetail);
  const result = useAPI(
    api.timePer,
    interval.start,
    interval.end,
    interval.timesplit,
  );

  const data = buildXYData(
    result?.map(r => ({
      _id: r._id as DateId,
      value: r.count,
    })) ?? [],
    interval.start,
    interval.end,
  );

  const formatX = useFormatXAxis(data);
  const formatY = useCallback((value: number) => `${msToMinutes(value)}m`, []);
  const formatYTooltip = useCallback(
    (value: number) => `${msToMinutes(value)} minutes listened`,
    [],
  );

  if (!result) {
    return (
      <LoadingImplementedChart title="Time listened" className={className} />
    );
  }

  if (result.length > 0 && result[0]._id == null) {
    return null;
  }

  return (
    <ChartCard title="Time listened" className={className}>
      <Line
        data={data}
        xFormat={formatX}
        yFormat={formatY}
        tooltipLabelFormatter={formatXAxisDateTooltip}
        tooltipValueFormatter={formatYTooltip}
      />
    </ChartCard>
  );
}
