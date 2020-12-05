import React from 'react';
import { Grid, Typography } from '@material-ui/core';
import { connect } from 'react-redux';
import s from './index.module.css';
import AlbumDatePer from '../../components/Stats/Graphs/Normal/AlbumDatePer';
import DifferentArtistsPer from '../../components/Stats/Graphs/Normal/DifferentArtistsPer';
import FeatRatioPer from '../../components/Stats/Graphs/Normal/FeatRatioPer';
import PopularityPer from '../../components/Stats/Graphs/Normal/PopularityPer';
import SongsPer from '../../components/Stats/Graphs/Normal/SongsPer';
import TimePer from '../../components/Stats/Graphs/Normal/TimePer';
import BestArtists from '../../components/Stats/Graphs/Normal/BestArtists';
import API from '../../services/API';
import { mapStateToProps, mapDispatchToProps } from '../../services/redux/tools';
import QuickInterval, { PrefabToInter } from '../../components/QuickInterval';
import HourOfDay from '../../components/Stats/Graphs/Normal/HourOfDay';

const StatClasses = [
  BestArtists,
  AlbumDatePer,
  DifferentArtistsPer,
  FeatRatioPer,
  PopularityPer,
  SongsPer,
  TimePer,
  HourOfDay,
];

class AllStats extends React.Component {
  constructor(props) {
    super(props);

    const { user } = this.props;

    const prefabIdx = PrefabToInter.findIndex(e => e.name === user.settings.preferredStatsPeriod);
    const prefab = PrefabToInter[prefabIdx];

    const { inter, timeSplit } = prefab.fn();
    const { start, end } = inter;

    this.state = {
      prefab: prefabIdx,
      globalStart: start,
      globalEnd: end,
      globalTimeSplit: timeSplit,
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

  changePrefab = (ev, idx) => {
    const infos = PrefabToInter[idx];

    API.setSetting('preferredStatsPeriod', infos.name);
    const { inter, timeSplit } = infos.fn();

    this.setState({
      prefab: idx,
      globalStart: inter.start,
      globalEnd: inter.end,
      globalTimeSplit: timeSplit,
    });
  }

  render() {
    const {
      globalStart, globalEnd, globalTimeSplit, prefab,
    } = this.state;

    return (
      <div className={s.root}>
        <div className={s.title}>
          <Grid container alignItems="center" justify="space-between">
            <Grid item xs={12} lg={5} style={{ textAlign: 'left' }}>
              <Typography variant="h4" center="left">All the statistics I could find on you</Typography>
            </Grid>
            <Grid item xs={12} lg={7} alignItems="center" justify="flex-end">
              <QuickInterval
                interval={prefab}
                timeSplit={globalTimeSplit}
                onChangeInterval={this.changePrefab}
                onChangeTimesplit={this.change('globalTimeSplit')}
              />
            </Grid>
          </Grid>
          <div className={s.leftTitle}>
          </div>
        </div>
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

export default connect(mapStateToProps, mapDispatchToProps)(AllStats);
