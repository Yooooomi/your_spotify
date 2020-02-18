import React from 'react';
import { connect } from 'react-redux';
import { Typography, Grid, Divider } from '@material-ui/core';
import cl from 'classnames';
import s from './index.module.css';
import { mapStateToProps, mapDispatchToProps } from '../../services/redux/tools';
import History from '../../components/Stats/History';
import TimeToday from '../../components/Stats/Cards/Normal/TimeToday';
import SongsToday from '../../components/Stats/Cards/Normal/SongsToday';
import TimePer from '../../components/Stats/Graphs/Normal/TimePer';
import BestSong from '../../components/Stats/Cards/Normal/BestSong';
import BestArtist from '../../components/Stats/Cards/Normal/BestArtist';
import ShowIfInScreen from '../../components/ShowIfInScreen';
import { today } from '../../services/interval';
import BestArtists from '../../components/Stats/Graphs/Normal/BestArtists';
import DifferentArtists from '../../components/Stats/Cards/Normal/DifferentArtists';

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
      loaded: this.loadedNb,
    });
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
        <hr className={s.divider} />
        <div className={cl(s.content, loadedNb === 4 ? s.content : s.contenthidden)}>
          <Grid container spacing={3} alignContent="stretch">
            
            <Grid container item xs={12} lg={6} spacing={0}>
              <Grid item xs={12} lg={6}>
                <div className={cl(s.left, s.firstleft)}><SongsToday loaded={this.loaded} /></div>
              </Grid>
              <Grid item xs={12} lg={6}>
                <div className={cl(s.left, s.secondleft)}><DifferentArtists /></div>
              </Grid>
              <Grid item xs={12}>
                <div><TimeToday loaded={this.loaded} /></div>
              </Grid>
            </Grid>

            <Grid item xs={12} lg={6}>
              <BestArtists />
            </Grid>

            <Grid item xs={6} lg={3}>
              <BestSong loaded={this.loaded} />
            </Grid>
            <Grid item xs={6} lg={3}>
              <BestArtist loaded={this.loaded} />
            </Grid>
            <Grid style={{ minHeight: '250px' }} item xs={12} lg={6}>
              <TimePer start={this.inter.start} end={this.inter.end} timeSplit="hour" />
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
