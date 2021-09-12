import React, { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import SimpleLineChart from '../../../../Chart/SimpleLineChart';
import API from '../../../../../services/API';
import BasicChart from '../../BasicChart';
import { useAPICall } from '../../../../../services/hooks';
import { selectUser } from '../../../../../services/redux/selector';

const STAT_NAME = 'Listening repartition over day';

function HourOfDay({ className, start, end }) {
  const user = useSelector(selectUser);

  const treatStats = useCallback(res => {
    const result = Array.from(Array(24).keys()).map((_, k) => ({ _id: k, count: 0 }));

    res.forEach(hour => {
      result[hour._id].count = hour.count; // Math.floor(hour.count / total * 100) / 100;
    });

    return result;
  }, []);

  const [stats, status] = useAPICall(API.timePerHourOfDay, [start, end], treatStats);
  // const stats = useFilledStats(rawStats, start, end, timeSplit, null);

  const chartData = useMemo(() => {
    if (!stats) return [];
    const total = stats.reduce((acc, curr) => acc + curr.count, 0);
    const result = Array.from(Array(24).keys()).map((_, k) => ({ x: k, y: 0 }));

    stats.forEach(hour => {
      result[hour._id].y = Math.floor((hour.count / total) * 100) / 100;
    });
    return result;
  }, [stats]);

  const tooltipFormatter = useCallback((_, __, { payload }) => {
    const { x } = payload;

    const value = stats[x]?.count || 0;
    const total = stats.reduce((acc, curr) => acc + curr.count, 0);
    const perc = Math.round((value / total) * 100);

    if (user.settings.metricUsed === 'number') {
      return `${x.toString().padStart(2, '0')}h, listened a total of ${value} songs, ${perc}% of the day average`;
    }
    if (user.settings.metricUsed === 'duration') {
      const minutes = Math.floor(value / 1000 / 60);
      return `${x.toString().padStart(2, '0')}h, listened a total of ${minutes} minutes, ${perc}% of the day average`;
    }
    return '';
  }, [user, stats]);

  const getXFormat = useCallback(value => {
    if (value % 2 === 0) {
      return `${value}h`;
    }
    return '';
  }, []);

  const getYFormat = useCallback(value => `${Math.floor(value * 10000) / 100}%`, []);

  return (
    <BasicChart
      name={STAT_NAME}
      stats={stats}
      status={status}
      className={className}
    >
      <SimpleLineChart
        forceXToDisplay
        xFormat={getXFormat}
        yFormat={getYFormat}
        tFormat={tooltipFormatter}
        type="bar"
        xName="Date"
        yName="Percentage"
        start={start}
        end={end}
        data={chartData}
      />
    </BasicChart>
  );
}

export default HourOfDay;
