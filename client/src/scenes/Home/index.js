import React from 'react';
import { connect } from 'react-redux';
import { Typography, Grid } from '@material-ui/core';
import s from './index.module.css';
import { mapStateToProps, mapDispatchToProps } from '../../services/redux/tools';
import History from '../../components/Stats/History';
import TimeToday from '../../components/Stats/Cards/Normal/TimeToday';
import SongsToday from '../../components/Stats/Cards/Normal/SongsToday';
import TimePer from '../../components/Stats/Graphs/Normal/TimePer';
import SongsPer from '../../components/Stats/Graphs/Normal/SongsPer';
import AlbumDatePer from '../../components/Stats/Graphs/Normal/AlbumDatePer';
import PopularityPer from '../../components/Stats/Graphs/Normal/PopularityPer';
import FeatRatioPer from '../../components/Stats/Graphs/Normal/FeatRatioPer';
import BestSong from '../../components/Stats/Cards/Normal/BestSong';
import API from '../../services/API';
import DifferentArtistsPer from '../../components/Stats/Graphs/Normal/DifferentArtistsPer';
import BestArtist from '../../components/Stats/Cards/Normal/BestArtist';

class Home extends React.Component {
  componentDidMount() {
    const start = new Date();
    start.setDate(start.getDate() - 7);
    const end = new Date();
    API.differentArtistsPer(start, end, 'hour').then(console.log, console.log);
  }

  render() {
    const { user } = this.props;

    return (
      <div className={s.root}>
        <div className={s.welcome}>
          <Typography align="left" variant="h4">
            Welcome&nbsp;
            {user.username}
          </Typography>
        </div>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <SongsToday />
          </Grid>
          <Grid item xs={6}>
            <TimeToday />
          </Grid>
          <Grid item xs={3}>
            <BestSong />
          </Grid>
          <Grid item xs={3}>
            <BestArtist />
          </Grid>
        </Grid>
        <TimePer />
        <SongsPer />
        <AlbumDatePer />
        <PopularityPer />
        <FeatRatioPer />
        <DifferentArtistsPer />
        <div className={s.welcome}>
          <Typography align="left" variant="h4">
            Recent play history
          </Typography>
        </div>
        <History nb={4} />
        <a href="http://localhost:8080/oauth/spotify">Spotify</a>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Home);
