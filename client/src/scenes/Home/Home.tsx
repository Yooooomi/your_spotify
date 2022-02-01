import { Grid } from '@material-ui/core';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import Header from '../../components/Header';
import History from '../../components/History';
import ArtistsListened from '../../components/ImplementedCards/ArtistsListened';
import BestArtist from '../../components/ImplementedCards/BestArtist';
import BestSong from '../../components/ImplementedCards/BestSong';
import SongsListened from '../../components/ImplementedCards/SongsListened';
import TimeListened from '../../components/ImplementedCards/TimeListened';
import ListeningRepartition from '../../components/ImplementedCharts/ListeningRepartition';
import TimeListenedPer from '../../components/ImplementedCharts/TimeListenedPer';
import { intervals } from '../../components/IntervalSelector/IntervalSelector';
import { selectUser } from '../../services/redux/modules/user/selector';
import s from './index.module.css';

export default function Home() {
  const user = useSelector(selectUser);
  const [interval, setInterval] = useState('0');

  if (!user) {
    return null;
  }

  return (
    <div className={s.root}>
      <Header
        interval={interval}
        onChange={setInterval}
        title={`Welcome, ${user.username} 🎉`}
        subtitle="Here is what happened for the period you chose on the right"
      />
      <div className={s.content}>
        <Grid container spacing={2} alignItems="stretch">
          <Grid item xs={12} md={12} lg={4}>
            <SongsListened interval={intervals[+interval].interval} />
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <TimeListened interval={intervals[+interval].interval} />
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <ArtistsListened interval={intervals[+interval].interval} />
          </Grid>
          <Grid item xs={12} md={6} lg={8}>
            <TimeListenedPer interval={intervals[+interval].interval} className={s.timelisten} />
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <BestArtist interval={intervals[+interval].interval} />
          </Grid>
          <Grid item xs={12} md={6} lg={8}>
            <ListeningRepartition
              interval={intervals[+interval].interval}
              className={s.timelisten}
            />
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <BestSong interval={intervals[+interval].interval} />
          </Grid>
          <Grid item xs={12} md={12} lg={12}>
            <History />
          </Grid>
        </Grid>
      </div>
    </div>
  );
}
