import React, { useMemo } from 'react';
import { Typography } from '@material-ui/core';
import API from '../../../../../services/API';
import { ratioValueAB } from '../../../../../services/operations';
import { useAPICall, usePreviousPeriod } from '../../../../../services/hooks';
import BasicCard from '../BasicCard';
import { Timesplits } from '../../../../../services/stats';

function DifferentArtists({ start, end }) {
  const [previousStart, previousEnd] = usePreviousPeriod(start, end);
  const [statsYesterday, statusYesterday] = useAPICall(
    API.differentArtistsPer,
    [previousStart, previousEnd, Timesplits.ALL],
  );
  const [stats, status] = useAPICall(API.differentArtistsPer, [start, end, Timesplits.ALL]);

  const bottom = useMemo(() => {
    if (!stats || !statsYesterday) return null;
    const value = stats.length > 0 ? stats[0].artists.length : 0;
    const oldValue = statsYesterday.length > 0 ? statsYesterday[0].artists.length : 0;

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

  if (!stats) return null;

  return (
    <BasicCard
      status={[status, statusYesterday]}
      top="Different artists"
      value={stats?.[0]?.artists?.length || 0}
      bottom={bottom}
    />
  );
}

export default DifferentArtists;
