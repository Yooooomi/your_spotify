import React, { useCallback, useMemo, useState } from 'react';
import API from '../../../../../services/API';
import { FillModes } from '../../IntervalChart';
import PercentChart from '../../../../Chart/PercentChart';
import { useAPICall, useFilledStats } from '../../../../../services/hooks';
import BasicChart from '../../BasicChart';

const toPercent = (decimal, fixed = 0) => `${(decimal * 100).toFixed(fixed)}%`;

const STAT_NAME = '10 best artists repartition over time';

function BestArtistsPer({
  className,
  start,
  end,
  timeSplit,
}) {
  const [allArtists, setAllArtists] = useState({});
  // const [artists, setArtists] = useState({});

  const treatStats = useCallback(res => {
    const newAllArtists = res.reduce((acc, curr) => {
      curr.artists.forEach(art => {
        acc[art.id] = art;
      });
      return acc;
    }, {});

    setAllArtists(newAllArtists);
    return res;
  }, []);

  const [rawStats, status] = useAPICall(API.bestArtistsPer, [start, end, timeSplit], treatStats);

  const dataGetter = useCallback(st => {
    if (st === null) {
      return { counts: new Array(Array(allArtists.length).keys()).map(() => 0), artists: Object.keys(allArtists) };
    }
    return st;
  }, [allArtists]);

  const stats = useFilledStats(rawStats, start, end, timeSplit, dataGetter, FillModes.ASK);

  const chartData = useMemo(() => {
    if (!stats) return null;

    const allArtistIds = Object.keys(allArtists);
    const data = stats.map((stat, k) => {
      const obj = { date: stat._id, x: k };
      const total = stat.data.counts.reduce((acc, curr) => acc + curr, 0);
      allArtistIds.forEach(art => {
        const artIdxForThisStat = stat.data.artists.findIndex(a => a.id === art);
        let count = 0;
        if (artIdxForThisStat >= 0) {
          count = stat.data.counts[artIdxForThisStat];
        }
        if (total === 0) {
          obj[art] = count;
        } else {
          obj[art] = (-count / total);
        }
      });
      return obj;
    });
    return data;
  }, [stats, allArtists]);

  const tooltipFormatter = useCallback((value, index) => [toPercent(-value), allArtists[index].name], [allArtists]);

  const getYFormat = useCallback(value => {
    let v = Math.floor((1 + value) * 100);
    if (v < 0) v = 0;
    return `${v}%`;
  }, []);

  const allArtistIds = Object.keys(allArtists);

  return (
    <BasicChart
      name={STAT_NAME}
      stats={stats}
      status={status}
      className={className}
    >
      <PercentChart
        xName="Date"
        yName="Different arists"
        yFormat={getYFormat}
        yDomain={[-1, 0]}
        start={start}
        end={end}
        data={chartData}
        keys={allArtistIds}
        tFormat={tooltipFormatter}
        tSorter={value => value.value}
      />
    </BasicChart>
  );
}

/* <AreaChart
  width={500}
  height={400}
  data={data.data}
  margin={{
    top: 10,
    right: 30,
    left: 0,
    bottom: 0,
  }}
>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="name" tickFormatter={() => 'haha'} />
  <YAxis tickFormatter={toPercent} />
  <Tooltip labelFormatter={() => 'hihi'} />
  {areas}
</AreaChart> */

export default BestArtistsPer;
