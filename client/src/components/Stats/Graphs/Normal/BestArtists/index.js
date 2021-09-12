import React, { useCallback, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import SimpleLineChart from '../../../../Chart/SimpleLineChart';
import API from '../../../../../services/API';
import BasicChart from '../../BasicChart';
import { useAPICall } from '../../../../../services/hooks';
import { selectUser } from '../../../../../services/redux/selector';
import { Timesplits } from '../../../../../services/stats';

const STAT_NAME = 'Best artists';

function BestArtists({ className, start, end }) {
  const user = useSelector(selectUser);
  const [elementsShown, setElementsShown] = useState(7);
  const [rawStats, status] = useAPICall(API.mostListenedArtist, [start, end, Timesplits.ALL]);
  const stats = rawStats?.[0] || null;

  const onResize = useCallback((width) => {
    setElementsShown(Math.max(1, Math.floor(width / 50)));
  }, []);

  const chartData = useMemo(() => {
    if (!stats) return null;
    const { counts } = stats;

    const artists = stats.artists.slice(0, Math.min(stats.artists.length, elementsShown));

    const ret = artists.map((art, k) => ({
      x: k,
      y: counts[k],
      name: art.name,
    }));
    return ret;
  }, [elementsShown, stats]);

  const getXFormat = useCallback(value => {
    const art = stats.artists[value];

    return { name: art.name, url: art?.images[art.images.length - 1]?.url, link: `/artist/${art?.id}` };
  }, [stats]);

  const getYFormat = useCallback(value => {
    if (user.settings.metricUsed === 'duration') {
      return Math.floor(value / 1000 / 60);
    }
    if (user.settings.metricUsed === 'number') {
      return Math.floor(value);
    }
    return '';
  }, [user]);

  const tooltipFormatter = useCallback((value, __, { payload }) => {
    const { y, name } = payload;

    if (user.settings.metricUsed === 'number') {
      return `Listened to ${name} ${y} time${y > 1 ? 's' : ''}`;
    }
    if (user.settings.metricUsed === 'duration') {
      const minutes = Math.floor(value / 1000 / 60);
      return `Listened to ${name} for ${minutes} minutes${minutes > 1 ? 's' : ''}`;
    }
    return '';
  }, [user]);

  return (
    <BasicChart
      className={className}
      name={STAT_NAME}
      stats={stats}
      status={status}
      onResize={onResize}
    >
      <SimpleLineChart
        tFormat={tooltipFormatter}
        xFormat={getXFormat}
        yFormat={getYFormat}
        xDomain={[0, chartData ? (chartData.length - 1) : 0]}
        type="bar"
        xName="Date"
        yName="Best artists"
        forceXToDisplay
        xIsImage
        start={start}
        end={end}
        data={chartData}
      />
    </BasicChart>
  );
}

export default BestArtists;
