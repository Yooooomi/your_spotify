import { Grid } from "@material-ui/core";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import Header from "../../components/Header";
import History from "../../components/History";
import ArtistsListened from "../../components/ImplementedCards/ArtistsListened";
import BestArtist from "../../components/ImplementedCards/BestArtist";
import BestSong from "../../components/ImplementedCards/BestSong";
import SongsListened from "../../components/ImplementedCards/SongsListened";
import TimeListened from "../../components/ImplementedCards/TimeListened";
import AverageAlbumReleaseDate from "../../components/ImplementedCharts/AverageAlbumReleaseDate";
import AverageNumberArtistPer from "../../components/ImplementedCharts/AverageNumberArtistPer";
import AverageSongPopularityPer from "../../components/ImplementedCharts/AverageSongPopularityPer";
import BestArtistsBar from "../../components/ImplementedCharts/BestArtistsBar";
import DifferentArtistsListenedPer from "../../components/ImplementedCharts/DifferentArtistListenedPer";
import ListeningRepartition from "../../components/ImplementedCharts/ListeningRepartition";
import SongsListenedPer from "../../components/ImplementedCharts/SongsListenedPer";
import TimeListenedPer from "../../components/ImplementedCharts/TimeListenedPer";
import IntervalSelector from "../../components/IntervalSelector";
import { intervals } from "../../components/IntervalSelector/IntervalSelector";
import { selectUser } from "../../services/redux/modules/user/selector";
import s from "./index.module.css";

const lastWeek = new Date();
lastWeek.setDate(lastWeek.getDate() - 60);
const now = new Date();

export default function Home() {
  const user = useSelector(selectUser);
  const [interval, setInterval] = useState("0");

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
            <TimeListenedPer
              interval={intervals[+interval].interval}
              className={s.timelisten}
            />
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
        {/* <BestArtistsBar interval={intervals[+interval].interval} />
        <ListeningRepartition interval={intervals[+interval].interval} />
        <AverageSongPopularityPer interval={intervals[+interval].interval} />
        <AverageNumberArtistPer interval={intervals[+interval].interval} />
        <DifferentArtistsListenedPer interval={intervals[+interval].interval} />
        <AverageAlbumReleaseDate interval={intervals[+interval].interval} />
        <SongsListenedPer interval={intervals[+interval].interval} /> */}
      </div>
    </div>
  );
}
