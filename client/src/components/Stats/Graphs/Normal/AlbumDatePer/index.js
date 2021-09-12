import React, { useCallback, useMemo } from 'react';
import API from '../../../../../services/API';
import SimpleLineChart from '../../../../Chart/SimpleLineChart';
import { formatDateFromYearDecimal } from '../../../../../services/date';
import { useAPICall, useFilledStats } from '../../../../../services/hooks';
import BasicChart from '../../BasicChart';

function AlbumDatePer({
  className,
  start,
  end,
  timeSplit,
}) {
  const [rawStats, status] = useAPICall(API.albumDateRatio, [start, end, timeSplit]);

  const dataGetter = useCallback(st => {
    if (st === null) return 0;
    return st.totalYear;
  }, []);

  const stats = useFilledStats(rawStats, start, end, timeSplit, dataGetter);

  const chartData = useMemo(
    () => stats?.map((stat, k) => ({ x: k, y: stat.data, date: stat._id })) || null,
    [stats],
  );

  return (
    <BasicChart
      name="Average album release date"
      stats={stats}
      status={status}
      className={className}
    >
      <SimpleLineChart
        xName="Date"
        yName="Average album release date"
        yDomain={[min => Number(min) - 1, max => Number(max) + 1]}
        start={start}
        end={end}
        tValueFormat={formatDateFromYearDecimal}
        yFormat={value => Math.trunc(value * 10) / 10}
        data={chartData}
      />
    </BasicChart>
  );
}

export default AlbumDatePer;
