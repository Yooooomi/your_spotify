import React from 'react';
import { Typography } from '@material-ui/core';
import API from '../../../../../services/API';
import BasicCard from '../BasicCard';
import { ratioValueAB } from '../../../../../services/operations';

class SongsPerCard extends BasicCard {
  constructor(props) {
    super(props);

    this.state = {
      ...this.state,
      stats: null,
      statsYesterday: null,
    };
  }

  async refresh() {
    const {
      start, end, previousStart, previousEnd,
    } = this.state;

    const todayStats = await API.songsPer(start, end, 'all');
    const yesterdayStats = await API.songsPer(previousStart, previousEnd, 'all');

    this.setState({
      stats: todayStats.data,
      statsYesterday: yesterdayStats.data,
    });
  }

  isReady = () => {
    const { stats } = this.state;

    return !!stats;
  }

  getTop = () => 'Songs'

  getValue = () => {
    const { stats } = this.state;

    if (stats.length === 0) return 0;
    return stats[0].count;
  }

  getBottom = () => {
    const { stats, statsYesterday } = this.state;

    const value = stats.length > 0 ? stats[0].count : 0;
    const oldValue = statsYesterday.length > 0 ? statsYesterday[0].count : 0;

    const moreOrLessThanYesterday = Math.floor(ratioValueAB(oldValue, value));

    if (moreOrLessThanYesterday < 0) {
      return (
        <Typography variant="subtitle1">
          <Typography color="error" component="span" variant='subtitle2'>
            {moreOrLessThanYesterday}%
          </Typography>
          &nbsp;less for this period
        </Typography>
      );
    }
    return (
      <Typography variant="subtitle1">
        <Typography style={{ color: '#255E2B' }} component="span" variant='subtitle2'>
          {moreOrLessThanYesterday}%
        </Typography>
          &nbsp;more for this period
      </Typography>
    );
  }
}

export default SongsPerCard;
