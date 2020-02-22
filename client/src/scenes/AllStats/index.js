import React from 'react';
import { Grid, Typography, Tabs, Tab, Select, MenuItem } from '@material-ui/core';
import s from './index.module.css';
import AlbumDatePer from '../../components/Stats/Graphs/Normal/AlbumDatePer';
import DifferentArtistsPer from '../../components/Stats/Graphs/Normal/DifferentArtistsPer';
import FeatRatioPer from '../../components/Stats/Graphs/Normal/FeatRatioPer';
import PopularityPer from '../../components/Stats/Graphs/Normal/PopularityPer';
import SongsPer from '../../components/Stats/Graphs/Normal/SongsPer';
import TimePer from '../../components/Stats/Graphs/Normal/TimePer';
import IntervalModifier from '../../components/IntervalModifier';
import { lastMonth, lastDay, lastWeek, lastYear } from '../../services/interval';
import BestArtists from '../../components/Stats/Graphs/Normal/BestArtists';
import API from '../../services/API';
import { connect } from 'react-redux';
import { mapStateToProps, mapDispatchToProps } from '../../services/redux/tools';

const StatClasses = [
  BestArtists,
  AlbumDatePer,
  DifferentArtistsPer,
  FeatRatioPer,
  PopularityPer,
  SongsPer,
  TimePer,
];

const PrefabToInter = [
  { name: 'day', fn: () => ({ inter: lastDay(), timeSplit: 'hour' }) },
  { name: 'week', fn: () => ({ inter: lastWeek(), timeSplit: 'day' }) },
  { name: 'month', fn: () => ({ inter: lastMonth(), timeSplit: 'day' }) },
  { name: 'year', fn: () => ({ inter: lastYear(), timeSplit: 'month' }) },
];

const timeSplits = [
  'hour',
  'day',
  'month',
  'year',
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
    const { globalStart, globalEnd, globalTimeSplit, prefab } = this.state;

    return (
      <div className={s.root}>
        <div className={s.title}>
          <div className={s.leftTitle}>
            <Typography variant="h4" center="left">All the statistics I could find on you</Typography>
          </div>
          <div className={s.interval}>
            <Tabs
              value={prefab}
              onChange={this.changePrefab}
            >
              <Tab label="Last day" />
              <Tab label="Last week" />
              <Tab label="Last month" />
              <Tab label="Last year" />
            </Tabs>
            <Typography className={s.every}>every</Typography>
            <Select
              className={s.select}
              onChange={(ev) => this.change('globalTimeSplit')(ev.target.value)}
              value={globalTimeSplit}
            >
              {
                timeSplits.map(e => (
                  <MenuItem key={e} value={e}><div className={s.menuItem}>{e}</div></MenuItem>
                ))
              }
            </Select>
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
