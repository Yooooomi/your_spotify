import { Grid } from '@mui/material';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import Header from '../../components/Header';
import ArtistListeningRepartition from '../../components/ImplementedCharts/ArtistListeningRepartition';
import AverageAlbumReleaseDate from '../../components/ImplementedCharts/AverageAlbumReleaseDate';
import AverageNumberArtistPer from '../../components/ImplementedCharts/AverageNumberArtistPer';
import AverageSongPopularityPer from '../../components/ImplementedCharts/AverageSongPopularityPer';
import BestArtistsBar from '../../components/ImplementedCharts/BestArtistsBar';
import DifferentArtistListenedPer from '../../components/ImplementedCharts/DifferentArtistListenedPer';
import ListeningRepartition from '../../components/ImplementedCharts/ListeningRepartition';
import SongsListenedPer from '../../components/ImplementedCharts/SongsListenedPer';
import TimeListenedPer from '../../components/ImplementedCharts/TimeListenedPer';
import { intervals } from '../../components/IntervalSelector/IntervalSelector';
import { selectUser } from '../../services/redux/modules/user/selector';
import s from './index.module.css';

export default function AllStats() {
  const user = useSelector(selectUser);
  const [interval, setInterval] = useState(intervals[0]);

  if (!user) {
    return null;
  }

  return (
    <div className={s.root}>
      <Header
        title="All stats"
        subtitle="You can find here all kind of stats based on the time span on the
          right"
        interval={interval}
        onChange={setInterval}
      />
      <div className={s.content}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={12} lg={6}>
            <BestArtistsBar interval={interval.interval} className={s.chart} />
          </Grid>
          <Grid item xs={12} md={12} lg={6}>
            <ListeningRepartition interval={interval.interval} className={s.chart} />
          </Grid>
          <Grid item xs={12} md={12} lg={6}>
            <ArtistListeningRepartition interval={interval.interval} className={s.chart} />
          </Grid>
          <Grid item xs={12} md={12} lg={6}>
            <AverageSongPopularityPer interval={interval.interval} className={s.chart} />
          </Grid>
          <Grid item xs={12} md={12} lg={6}>
            <AverageAlbumReleaseDate interval={interval.interval} className={s.chart} />
          </Grid>
          <Grid item xs={12} md={12} lg={6}>
            <DifferentArtistListenedPer interval={interval.interval} className={s.chart} />
          </Grid>
          <Grid item xs={12} md={12} lg={6}>
            <AverageNumberArtistPer interval={interval.interval} className={s.chart} />
          </Grid>
          <Grid item xs={12} md={12} lg={6}>
            <SongsListenedPer interval={interval.interval} className={s.chart} />
          </Grid>
          <Grid item xs={12} md={12} lg={6}>
            <TimeListenedPer interval={interval.interval} className={s.chart} />
          </Grid>
        </Grid>
      </div>
    </div>
  );
}
