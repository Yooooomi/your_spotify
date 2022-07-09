import React from 'react';
import { useSelector } from 'react-redux';
import { api } from '../../../services/api';
import { useAPI } from '../../../services/hooks';
import { selectRawIntervalDetail } from '../../../services/redux/modules/user/selector';
import {
  buildXYData,
  formatXAxisDateTooltip,
  formatYAxisDate,
  useFormatXAxis,
} from '../../../services/stats';
import { DateId } from '../../../services/types';
import ChartCard from '../../ChartCard';
import Line from '../../charts/Line';
import LoadingImplementedChart from '../LoadingImplementedChart';
import { ImplementedChartProps } from '../types';

interface AverageAlbumReleaseDateProps extends ImplementedChartProps {}

export default function AverageAlbumReleaseDate({
  className,
}: AverageAlbumReleaseDateProps) {
  const { interval } = useSelector(selectRawIntervalDetail);
  const result = useAPI(
    api.albumDateRatio,
    interval.start,
    interval.end,
    interval.timesplit,
  );

  const data = buildXYData(
    result?.map(r => ({
      _id: r._id as DateId,
      value: Math.floor(r.totalYear * 100) / 100,
    })) ?? [],
    interval.start,
    interval.end,
    true,
  );

  const formatX = useFormatXAxis(data);

  if (!result) {
    return (
      <LoadingImplementedChart
        title="Average album release date"
        className={className}
      />
    );
  }

  if (result.length > 0 && result[0]._id == null) {
    return null;
  }

  return (
    <ChartCard title="Average album release date" className={className}>
      <Line
        data={data}
        xFormat={formatX}
        yFormat={formatYAxisDate}
        tooltipLabelFormatter={formatXAxisDateTooltip}
        tooltipValueFormatter={formatYAxisDate}
      />
    </ChartCard>
  );
}
