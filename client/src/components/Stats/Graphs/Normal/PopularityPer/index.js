import React, { useCallback, useMemo } from 'react';
import API from '../../../../../services/API';
import SimpleLineChart from '../../../../Chart/SimpleLineChart';
import { useAPICall, useFilledStats } from '../../../../../services/hooks';
import BasicChart from '../../BasicChart';

const STAT_NAME = 'Average song popularity';

function PopularityPer({
  className,
  start,
  end,
  timeSplit,
}) {
  const [rawStats, status] = useAPICall(API.popularityPer, [start, end, timeSplit]);

  const dataGetter = useCallback(st => {
    if (st === null) return 0;
    return st.totalPopularity;
  }, []);

  const stats = useFilledStats(rawStats, start, end, timeSplit, dataGetter);

  const chartData = useMemo(() => stats?.map((stat, k) => ({ x: k, y: stat.data, date: stat._id })) || null, [stats]);

  const getYFormat = useCallback(value => `${value}%`, []);

  return (
    <BasicChart
      name={STAT_NAME}
      stats={stats}
      status={status}
      className={className}
    >
      <SimpleLineChart
        xName="Date"
        yName="Average popularity"
        yFormat={getYFormat}
        start={start}
        end={end}
        tValueFormat={value => `${Math.floor(value)}% popularity`}
        data={chartData}
      />
    </BasicChart>
  );
}

export default PopularityPer;
