import React, { useCallback, useMemo, useState } from 'react';
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
import TextScreenSize from '../../components/TextScreenSize';
import BestArtistsPer from '../../components/Stats/Graphs/Normal/BestArtistsPer';
import Divider from '../../components/Divider';

const StatClasses = [
  BestArtistsPer,
  BestArtists,
  AlbumDatePer,
  DifferentArtistsPer,
  FeatRatioPer,
  PopularityPer,
  SongsPer,
  TimePer,
  HourOfDay,
];

function AllStats({ user }) {
  const [prefabIdx, setPrefabIdx] = useState(
    PrefabToInter.findIndex(e => e.name === user.settings.preferredStatsPeriod),
  );

  const prefab = useMemo(() => PrefabToInter[prefabIdx], [prefabIdx]);
  const { inter, timeSplit } = prefab.fn();
  const { start, end } = inter;

  const [globalStart, setGlobalStart] = useState(start);
  const [globalEnd, setGlobalEnd] = useState(end);
  const [globalTimeSplit, setGlobalTimeSplit] = useState(timeSplit);

  const changePrefab = useCallback((ev, idx) => {
    const infos = PrefabToInter[idx];

    API.setSetting('preferredStatsPeriod', infos.name);
    const { inter: newInter, timeSplit: newTimeSplit } = infos.fn();

    setPrefabIdx(idx);
    setGlobalStart(newInter.start);
    setGlobalEnd(newInter.end);
    setGlobalTimeSplit(newTimeSplit);
  }, []);

  return (
    <div className={s.root}>
      <div className={s.title}>
        <Grid container alignItems="center" justify="space-between">
          <Grid item xs={12} lg={5} style={{ textAlign: 'left' }}>
            <Typography variant="h4" center="left">
              <TextScreenSize phone="All the statistics" plusDesktop=" I could find on you" />
            </Typography>
          </Grid>
          <Grid item xs={12} lg="auto">
            <QuickInterval
              interval={prefabIdx}
              timeSplit={globalTimeSplit}
              onChangeInterval={changePrefab}
              onChangeTimesplit={setGlobalTimeSplit}
            />
          </Grid>
        </Grid>
        <div className={s.leftTitle} />
      </div>
      <Divider />
      <Grid spacing={2} container>
        {
          StatClasses.map(Class => (
            <Grid key={Class.name} className={s.graph} item xs={12} md={12} lg={6}>
              <Class start={globalStart} end={globalEnd} timeSplit={globalTimeSplit} user={user} />
            </Grid>
          ))
        }
      </Grid>
    </div>
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(AllStats);
