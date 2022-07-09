import React, { useMemo, useCallback } from 'react';
import { useSelector } from 'react-redux';
import {
  ResponsiveContainer,
  AreaChart,
  XAxis,
  YAxis,
  Tooltip,
  Area,
} from 'recharts';
import { api } from '../../../services/api';
import { useRawTooltipLabelFormatter } from '../../../services/chart';
import { getColor } from '../../../services/colors';
import { useAPI } from '../../../services/hooks';
import { selectRawIntervalDetail } from '../../../services/redux/modules/user/selector';
import {
  buildXYDataObjSpread,
  formatXAxisDateTooltip,
  useFormatXAxis,
} from '../../../services/stats';
import { Artist, DateId } from '../../../services/types';
import ChartCard from '../../ChartCard';
import LoadingImplementedChart from '../LoadingImplementedChart';
import { ImplementedChartProps } from '../types';

interface ArtistListeningRepartitionProps extends ImplementedChartProps {}

const formatYAxis = (value: any) => `${Math.floor(value * 100)}%`;

export default function ArtistListeningRepartition({
  className,
}: ArtistListeningRepartitionProps) {
  const { interval } = useSelector(selectRawIntervalDetail);
  const results = useAPI(
    api.mostListenedArtist,
    interval.start,
    interval.end,
    interval.timesplit,
  );

  const resultsWithCount = useMemo(
    () =>
      results?.map(res => ({
        _id: res._id,
        artists: res.artists.reduce<Record<string, number>>(
          (acc, curr, idx) => {
            acc[curr.id] = res.counts[idx];
            return acc;
          },
          {},
        ),
      })),
    [results],
  );

  const allArtists = useMemo(() => {
    const all: Record<string, Artist> = {};
    results?.forEach(res => {
      res.artists.forEach(art => {
        if (!(art.id in all)) {
          all[art.id] = art;
        }
      });
    });
    return all;
  }, [results]);

  const data = useMemo(() => {
    if (!resultsWithCount) {
      return [];
    }
    const d = resultsWithCount.map((curr, idx) => {
      const obj: { x: number; _id: DateId } & any = {
        x: idx,
        _id: curr._id as DateId,
      };
      const total = Object.values(curr.artists).reduce(
        (acc, count) => acc + count,
        0,
      );
      Object.values(allArtists).forEach(art => {
        obj[art.id] = (curr.artists[art.id] ?? 0) / total;
      });
      return obj;
    }, []);
    return buildXYDataObjSpread(
      d,
      Object.keys(allArtists),
      interval.start,
      interval.end,
      false,
    );
  }, [allArtists, interval, resultsWithCount]);

  const tooltipLabelFormatter = useRawTooltipLabelFormatter(
    formatXAxisDateTooltip,
    false,
  );

  const tooltipValueFormatter = useCallback(
    (value: number, label: string) => {
      if (value === 0) {
        return [<span />];
      }
      return [`${allArtists[label].name}: ${Math.floor(value * 1000) / 10}%`];
    },
    [allArtists],
  );

  const tooltipSorter = useCallback((a: any) => -a.payload[a.dataKey], []);

  const formatX = useFormatXAxis(data);

  if (!results) {
    return (
      <LoadingImplementedChart
        title="Artist listening distribution"
        className={className}
      />
    );
  }

  return (
    <ChartCard title="Artist listening distribution" className={className}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <XAxis
            dataKey="x"
            tickFormatter={formatX}
            style={{ fontWeight: 'bold' }}
          />
          <YAxis domain={[0, 1]} tickFormatter={formatYAxis} />
          <Tooltip
            formatter={tooltipValueFormatter}
            labelFormatter={tooltipLabelFormatter}
            wrapperStyle={{ zIndex: 1000 }}
            contentStyle={{ background: 'var(--background)' }}
            itemSorter={tooltipSorter}
          />
          {Object.values(allArtists).map((art, idx) => (
            <Area
              type="monotone"
              dataKey={art.id}
              key={art.id}
              stackId={-1}
              stroke={getColor(idx)}
              fill={getColor(idx)}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
