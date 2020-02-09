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
import ShowIfInScreen from '../../components/ShowIfInScreen';
import { today } from '../../services/interval';

class Home extends React.Component {
  constructor(props) {
    super(props);

    this.loadedNb = 0;

    this.inter = today();

    this.state = {
      loaded: 0,
    };
  }

  loaded = () => {
    this.loadedNb += 1;

    this.setState({
      loaded: this.loadedNb
    });
  }

  componentDidMount() {
    const start = new Date();
    start.setDate(start.getDate() - 7);
    const end = new Date();
    API.differentArtistsPer(start, end, 'hour').then(console.log, console.log);
  }

  render() {
    const { user } = this.props;
    const { loadedNb } = this;

    return (
      <div className={s.root}>
        <div className={loadedNb === 4 ? s.welcome : s.welcomehidden}>
          <Typography align="left" variant="h4">
            Welcome&nbsp;
            {user.username}
            &nbsp;here is your day summary
          </Typography>
        </div>
        <div className={s.content} className={loadedNb === 4 ? s.content : s.contenthidden}>
          <Grid container spacing={2} alignContent="stretch">
            <Grid item xs={12} lg={6}>
              <SongsToday loaded={this.loaded} />
            </Grid>
            <Grid item xs={12} lg={6}>
              <TimeToday loaded={this.loaded} />
            </Grid>
            <Grid item xs={6} lg={3}>
              <BestSong loaded={this.loaded} />
            </Grid>
            <Grid item xs={6} lg={3}>
              <BestArtist loaded={this.loaded} />
            </Grid>
            <Grid style={{ minHeight: '250px' }} item xs={12} lg={6}>
              <TimePer defaultStart={this.inter.start} defaultEnd={this.inter.end} defaultTimeSplit="hour" />
            </Grid>
          </Grid>
        </div>
        <ShowIfInScreen>
          <div className={s.listened}>
            <Typography variant="h4">
              What you listened to today
              </Typography>
          </div>
          <History xs={2} lg={4} />
        </ShowIfInScreen>
        {/* <SongsPer />
        <AlbumDatePer />
        <PopularityPer />
        <FeatRatioPer />
        <DifferentArtistsPer />
        <div className={s.welcome}>
          <Typography align="left" variant="h4">
            Recent play history
          </Typography>
        </div> */}

      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Home);
