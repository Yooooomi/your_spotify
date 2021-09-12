import React, { useCallback, useMemo } from 'react';
import API from '../../../../../services/API';
import SimpleLineChart from '../../../../Chart/SimpleLineChart';
import { useAPICall, useFilledStats } from '../../../../../services/hooks';
import BasicChart from '../../BasicChart';

const STAT_NAME = 'Number of different artists listened to';

function DifferentArtistsPer({
  className,
  start,
  end,
  timeSplit,
}) {
  const [rawStats, status] = useAPICall(API.differentArtistsPer, [start, end, timeSplit]);

  const dataGetter = useCallback(st => {
    if (st === null) return 0;
    return st.differents;
  }, []);

  const stats = useFilledStats(rawStats, start, end, timeSplit, dataGetter);

  const chartData = useMemo(() => stats?.map((stat, k) => ({ x: k, y: stat.data, date: stat._id })) || [], [stats]);

  return (
    <BasicChart
      name={STAT_NAME}
      stats={stats}
      status={status}
      className={className}
    >
      <SimpleLineChart
        xName="Date"
        yName="Different arists"
        start={start}
        end={end}
        tValueFormat={value => `${Math.round(value * 10) / 10} artists`}
        data={chartData}
      />
    </BasicChart>
  );
}

export default DifferentArtistsPer;
