import React from 'react';
import { Grid, Typography } from '@material-ui/core';
import s from './index.module.css';
import AlbumDatePer from '../../components/Stats/Graphs/Normal/AlbumDatePer';
import DifferentArtistsPer from '../../components/Stats/Graphs/Normal/DifferentArtistsPer';
import FeatRatioPer from '../../components/Stats/Graphs/Normal/FeatRatioPer';
import PopularityPer from '../../components/Stats/Graphs/Normal/PopularityPer';
import SongsPer from '../../components/Stats/Graphs/Normal/SongsPer';
import TimePer from '../../components/Stats/Graphs/Normal/TimePer';
import IntervalModifier from '../../components/IntervalModifier';
import { lastMonth } from '../../services/interval';
import BestArtists from '../../components/Stats/Graphs/Normal/BestArtists';

const StatClasses = [
  BestArtists,
  AlbumDatePer,
  DifferentArtistsPer,
  FeatRatioPer,
  PopularityPer,
  SongsPer,
  TimePer,
];

class AllStats extends React.Component {
  constructor(props) {
    super(props);

    const { start, end } = lastMonth();

    this.state = {
      globalStart: start,
      globalEnd: end,
      globalTimeSplit: 'day',
    };
  }

  change = field => value => {
    this.setState({
      [field]: value,
    });
  }

  getDays = () => {
    const { globalStart, globalEnd } = this.state;

    const diff = globalEnd.getTime() - globalStart.getTime();
    const days = diff / 1000 / 60 / 60 / 24;
    return Math.floor(days);
  }

  render() {
    const { globalStart, globalEnd, globalTimeSplit } = this.state;

    return (
      <div className={s.root}>
        <div className={s.title}>
          <Typography variant="h4" center="center">All the statistics I could find on you</Typography>
          <IntervalModifier
            start={globalStart}
            end={globalEnd}
            timeSplit={globalTimeSplit}
            onStartChange={this.change('globalStart')}
            onEndChange={this.change('globalEnd')}
            onTimeSplitChange={this.change('globalTimeSplit')}
          />
        </div>
        <Typography variant="subtitle1">Last {this.getDays()} days</Typography>
        <Grid spacing={2} container>
          {
            StatClasses.map(Class => (
              <Grid key={Class.name} className={s.graph} item xs={12} md={12} lg={6}>
                <Class start={globalStart} end={globalEnd} timeSplit={globalTimeSplit} />
              </Grid>
            ))
          }
        </Grid>
      </div>
    );
  }
}

export default AllStats;
