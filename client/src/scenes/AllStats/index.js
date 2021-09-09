import React, { useCallback, useMemo, useState } from 'react';
import { Grid, Typography } from '@material-ui/core';
import { useSelector } from 'react-redux';
import s from './index.module.css';
import AlbumDatePer from '../../components/Stats/Graphs/Normal/AlbumDatePer';
import DifferentArtistsPer from '../../components/Stats/Graphs/Normal/DifferentArtistsPer';
import FeatRatioPer from '../../components/Stats/Graphs/Normal/FeatRatioPer';
import PopularityPer from '../../components/Stats/Graphs/Normal/PopularityPer';
import SongsPer from '../../components/Stats/Graphs/Normal/SongsPer';
import TimePer from '../../components/Stats/Graphs/Normal/TimePer';
import BestArtists from '../../components/Stats/Graphs/Normal/BestArtists';
import API from '../../services/API';
import QuickInterval, { PrefabToInter } from '../../components/QuickInterval';
import HourOfDay from '../../components/Stats/Graphs/Normal/HourOfDay';
import TextScreenSize from '../../components/TextScreenSize';
import BestArtistsPer from '../../components/Stats/Graphs/Normal/BestArtistsPer';
import Divider from '../../components/Divider';
import { selectUser } from '../../services/redux/selector';

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

function AllStats() {
  const user = useSelector(selectUser);

  const [prefabIdx] = useState(
    PrefabToInter.findIndex(e => e.name === user.settings.preferredStatsPeriod),
  );

  const prefab = useMemo(() => PrefabToInter[prefabIdx], [prefabIdx]);
  const [timeSplit, setTimeSplit] = useState(prefab.fn().timeSplit);
  const [inter, setInter] = useState(prefab.fn().inter);

  const changeInterval = useCallback((value, idx) => {
    const infos = PrefabToInter[idx];

    if (infos) {
      API.setSetting('preferredStatsPeriod', infos.name);
    }
    setInter(value);
  }, []);

  return (
    <div>
      <div className={s.title}>
        <Grid container alignItems="center" justify="space-between">
          <Grid item xs={12} lg={5} style={{ textAlign: 'left' }}>
            <Typography variant="h4" center="left">
              <TextScreenSize phone="All the statistics" plusDesktop=" I could find on you" />
            </Typography>
          </Grid>
          <Grid item xs={12} lg="auto">
            <QuickInterval
              defaultTab={prefabIdx}
              interval={inter}
              timeSplit={timeSplit}
              onChangeInterval={changeInterval}
              onChangeTimesplit={setTimeSplit}
            />
          </Grid>
        </Grid>
        <div />
      </div>
      <Divider />
      <Grid spacing={2} container>
        {
          StatClasses.map(Class => (
            <Grid key={Class.name} className={s.graph} item xs={12} md={12} lg={6}>
              <Class start={inter.start} end={inter.end} timeSplit={timeSplit} user={user} />
            </Grid>
          ))
        }
      </Grid>
    </div>
  );
}

export default AllStats;
