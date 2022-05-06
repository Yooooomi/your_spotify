import { Grid } from '@mui/material';
import React from 'react';
import { useSelector } from 'react-redux';
import Header from '../../components/Header';
import ArtistListeningRepartition from '../../components/ImplementedCharts/ArtistListeningRepartition';
import AverageAlbumReleaseDate from '../../components/ImplementedCharts/AverageAlbumReleaseDate';
import AverageNumberArtistPer from '../../components/ImplementedCharts/AverageNumberArtistPer';
import AverageSongPopularityPer from '../../components/ImplementedCharts/AverageSongPopularityPer';
import BestArtistsBar from '../../components/ImplementedCharts/BestArtistsBar';
import BestOfHour from '../../components/ImplementedCharts/BestOfHour';
import DifferentArtistListenedPer from '../../components/ImplementedCharts/DifferentArtistListenedPer';
import ListeningRepartition from '../../components/ImplementedCharts/ListeningRepartition';
import SongsListenedPer from '../../components/ImplementedCharts/SongsListenedPer';
import TimeListenedPer from '../../components/ImplementedCharts/TimeListenedPer';
import { selectUser } from '../../services/redux/modules/user/selector';
import s from './index.module.css';

export default function AllStats() {
  const user = useSelector(selectUser);

  if (!user) {
    return null;
  }

  return (
    <div className={s.root}>
      <Header
        title="All stats"
        subtitle="You can find here all kind of stats based on the time span on the
          right"
      />
      <div className={s.content}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={12} lg={6}>
            <BestArtistsBar className={s.chart} />
          </Grid>
          <Grid item xs={12} md={12} lg={6}>
            <ListeningRepartition className={s.chart} />
          </Grid>
          <Grid item xs={12} md={12} lg={6}>
            <ArtistListeningRepartition className={s.chart} />
          </Grid>
          <Grid item xs={12} md={12} lg={6}>
            <BestOfHour className={s.chart} />
          </Grid>
          <Grid item xs={12} md={12} lg={6}>
            <SongsListenedPer className={s.chart} />
          </Grid>
          <Grid item xs={12} md={12} lg={6}>
            <TimeListenedPer className={s.chart} />
          </Grid>
          <Grid item xs={12} md={12} lg={6}>
            <DifferentArtistListenedPer className={s.chart} />
          </Grid>
          <Grid item xs={12} md={12} lg={6}>
            <AverageAlbumReleaseDate className={s.chart} />
          </Grid>
          <Grid item xs={12} md={12} lg={6}>
            <AverageNumberArtistPer className={s.chart} />
          </Grid>
          <Grid item xs={12} md={12} lg={6}>
            <AverageSongPopularityPer className={s.chart} />
          </Grid>
        </Grid>
      </div>
    </div>
  );
}
