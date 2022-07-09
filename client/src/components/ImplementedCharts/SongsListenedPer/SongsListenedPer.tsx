import React, { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { api } from '../../../services/api';
import { useAPI } from '../../../services/hooks';
import { selectRawIntervalDetail } from '../../../services/redux/modules/user/selector';
import {
  buildXYData,
  formatXAxisDateTooltip,
  useFormatXAxis,
} from '../../../services/stats';
import { DateId } from '../../../services/types';
import ChartCard from '../../ChartCard';
import Line from '../../charts/Line';
import LoadingImplementedChart from '../LoadingImplementedChart';
import { ImplementedChartProps } from '../types';

interface SongsListenedPerProps extends ImplementedChartProps {}

export default function SongsListenedPer({ className }: SongsListenedPerProps) {
  const { interval } = useSelector(selectRawIntervalDetail);
  const result = useAPI(
    api.songsPer,
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
  const tooltipValueFormatter = useCallback(
    (value: number) => `${value} songs`,
    [],
  );

  if (!result) {
    return (
      <LoadingImplementedChart title="Songs listened" className={className} />
    );
  }

  if (result.length > 0 && result[0]._id == null) {
    return null;
  }

  return (
    <ChartCard title="Songs listened" className={className}>
      <Line
        data={data}
        xFormat={formatX}
        tooltipLabelFormatter={formatXAxisDateTooltip}
        tooltipValueFormatter={tooltipValueFormatter}
      />
    </ChartCard>
  );
}
