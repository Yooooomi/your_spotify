import React from 'react';
import { Typography } from '@material-ui/core';
import API from '../../../../../services/API';
import BasicCard from '../BasicCard';
import { ratioValueAB } from '../../../../../services/operations';

class DifferentArtists extends BasicCard {
  constructor(props) {
    super(props);

    this.state = {
      ...this.state,
      statsYesterday: null,
      stats: null,
    };
  }

  refresh = async () => {
    const {
      start, end, previousStart, previousEnd,
    } = this.state;

    const stats = await API.differentArtistsPer(start, end, 'all');
    const statsYesterday = await API.differentArtistsPer(previousStart, previousEnd, 'all');

    this.setState({
      statsYesterday: statsYesterday.data,
      stats: stats.data,
    });
  }

  isReady = () => {
    const { stats } = this.state;

    return !!stats;
  }

  getTop = () => 'Different artists'

  getValue = () => {
    const { stats } = this.state;

    if (!stats.length) return 0;

    return stats[0].artists.length;
  }

  getBottom = () => {
    const { stats, statsYesterday } = this.state;

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
  }
}

export default DifferentArtists;
