import React, { useMemo } from 'react';
import { Typography } from '@material-ui/core';
import API from '../../../../../services/API';
import { ratioValueAB } from '../../../../../services/operations';
import BasicCard from '../BasicCard';
import { useAPICall, usePreviousPeriod } from '../../../../../services/hooks';
import { Timesplits } from '../../../../../services/stats';

function TimePerCard({ start, end }) {
  const [previousStart, previousEnd] = usePreviousPeriod(start, end);
  const [statsYesterday, statusYesterday] = useAPICall(API.timePer, [previousStart, previousEnd, Timesplits.ALL]);
  const [stats, status] = useAPICall(API.timePer, [start, end, Timesplits.ALL]);

  const cardValue = useMemo(() => {
    if (!stats) return null;
    if (stats.length === 0) return 0;
    return `${Math.floor(stats[0].count / (1000 * 60))}m`;
  }, [stats]);

  const bottom = useMemo(() => {
    if (!stats || !statsYesterday) return null;
    const value = stats.length > 0 ? stats[0].count : 0;
    const oldValue = statsYesterday.length > 0 ? statsYesterday[0].count : 0;

    const moreOrLessThanYesterday = Math.floor(ratioValueAB(oldValue, value));

    if (moreOrLessThanYesterday < 0) {
      return (
        <Typography variant="subtitle1">
          <Typography color="error" component="span" variant="subtitle2">
            {moreOrLessThanYesterday}
            %
          </Typography>
          &nbsp;less for this period
        </Typography>
      );
    }
    return (
      <Typography variant="subtitle1">
        <Typography style={{ color: '#255E2B' }} component="span" variant="subtitle2">
          {moreOrLessThanYesterday}
          %
        </Typography>
        &nbsp;more for this period
      </Typography>
    );
  }, [stats, statsYesterday]);

  return (
    <BasicCard
      status={[status, statusYesterday]}
      top="Time listened"
      value={cardValue}
      bottom={bottom}
    />
  );
}

export default TimePerCard;
