import React from 'react';
import { connect } from 'react-redux';
import { Typography, Grid, Divider } from '@material-ui/core';
import cl from 'classnames';
import s from './index.module.css';
import { mapStateToProps, mapDispatchToProps } from '../../services/redux/tools';
import History from '../../components/Stats/History';
import TimePerCard from '../../components/Stats/Cards/Normal/TimePerCard';
import SongsPerCard from '../../components/Stats/Cards/Normal/SongsPerCard';
import TimePer from '../../components/Stats/Graphs/Normal/TimePer';
import BestSong from '../../components/Stats/Cards/Normal/BestSong';
import BestArtist from '../../components/Stats/Cards/Normal/BestArtist';
import ShowIfInScreen from '../../components/ShowIfInScreen';
import { lastDay } from '../../services/interval';
import BestArtists from '../../components/Stats/Graphs/Normal/BestArtists';
import DifferentArtists from '../../components/Stats/Cards/Normal/DifferentArtists';

class Home extends React.Component {
  constructor(props) {
    super(props);

    this.loadedNb = 0;
    this.inter = lastDay();

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

    const { start, end } = this.inter;

    return (
      <div className={s.root}>
        <div className={loadedNb === 7 ? s.welcome : s.welcomehidden}>
          <Typography align="left" variant="h4">
            Welcome&nbsp;
            {user.username}
            &nbsp;here is your day summary
          </Typography>
        </div>
        <hr className={s.divider} />
        <div className={cl(s.content, loadedNb === 7 ? s.content : s.contenthidden)}>
          <Grid container spacing={2} alignContent="stretch">

            <Grid container item xs={12} lg={6} spacing={0}>
              <Grid item xs={12} lg={6}>
                <div className={cl(s.left, s.firstleft)}><SongsPerCard start={start} end={end} loaded={this.loaded} /></div>
              </Grid>
              <Grid item xs={12} lg={6}>
                <div className={cl(s.left, s.secondleft)}><DifferentArtists start={start} end={end} loaded={this.loaded} /></div>
              </Grid>
              <Grid item xs={12}>
                <div><TimePerCard start={start} end={end} loaded={this.loaded} /></div>
              </Grid>
            </Grid>

            <Grid item xs={12} lg={6}>
              <BestArtists start={start} end={end} loaded={this.loaded} />
            </Grid>

            <Grid item xs={6} lg={3}>
              <BestSong start={start} end={end} loaded={this.loaded} />
            </Grid>
            <Grid item xs={6} lg={3}>
              <BestArtist start={start} end={end} loaded={this.loaded} />
            </Grid>
            <Grid style={{ minHeight: '250px' }} item xs={12} lg={6}>
              <TimePer loaded={this.loaded} start={start} end={end} timeSplit="hour" />
            </Grid>
          </Grid>
        </div>
        <ShowIfInScreen>
          <hr className={s.divider} />
          <div className={s.listened}>
            <History maxOld={start} title="What you listened to today" xs={2} lg={4} />
          </div>
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
