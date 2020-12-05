import React from 'react';
import { connect } from 'react-redux';
import { Typography, Grid } from '@material-ui/core';
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
import QuickInterval, { PrefabToInter } from '../../components/QuickInterval';

class Home extends React.Component {
  constructor(props) {
    super(props);

    this.loadedNb = 0;

    const inter = lastDay();

    this.state = {
      prefab: 0,
      loaded: 0,
      timeSplit: 'hour',
      start: inter.start,
      end: inter.end,
    };
  }

  loaded = () => {
    this.loadedNb += 1;

    this.setState({
      loaded: this.loadedNb,
    });
  }

  changePrefab = (ev, idx) => {
    const prefab = PrefabToInter[idx];

    const infos = prefab.fn();
    const { inter } = infos;

    this.setState({
      prefab: idx,
      timeSplit: infos.timeSplit,
      start: inter.start,
      end: inter.end,
    });
  }

  changeTimesplit = timeSplit => {
    this.setState({
      timeSplit,
    });
  }

  render() {
    const { user } = this.props;
    const { loadedNb } = this;

    const {
      start, end, timeSplit, prefab,
    } = this.state;

    return (
      <div className={s.root}>
        <div className={loadedNb === 7 ? s.welcome : s.welcomehidden}>
          <Typography align="left" variant="h4">
            Welcome&nbsp;
            <span className={s.username}>{user.username}</span>
            &nbsp;here is your summary
          </Typography>
          <div>
            <QuickInterval
              interval={prefab}
              timeSplit={timeSplit}
              onChangeInterval={this.changePrefab}
              onChangeTimesplit={this.changeTimesplit}
            />
          </div>
        </div>
        <hr className={s.divider} />
        <div className={cl(s.content, loadedNb === 7 ? s.content : s.contenthidden)}>
          <Grid container spacing={2} alignContent="stretch">

            <Grid container item xs={12} lg={6} spacing={0}>
              <Grid item xs={12} lg={6}>
                <div className={cl(s.left, s.firstleft)}>
                  <SongsPerCard
                    timeSplit={timeSplit}
                    start={start}
                    end={end}
                    loaded={this.loaded}
                  />
                </div>
              </Grid>
              <Grid item xs={12} lg={6}>
                <div className={cl(s.left, s.secondleft)}>
                  <DifferentArtists
                    timeSplit={timeSplit}
                    start={start}
                    end={end}
                    loaded={this.loaded}
                  />
                </div>
              </Grid>
              <Grid item xs={12}>
                <div>
                  <TimePerCard
                    timeSplit={timeSplit}
                    start={start}
                    end={end}
                    loaded={this.loaded}
                  />
                </div>
              </Grid>
            </Grid>

            <Grid item xs={12} lg={6}>
              <BestArtists
                timeSplit={timeSplit}
                start={start}
                end={end}
                loaded={this.loaded}
              />
            </Grid>

            <Grid item xs={6} lg={3}>
              <BestSong
                timeSplit={timeSplit}
                start={start}
                end={end}
                loaded={this.loaded}
              />
            </Grid>
            <Grid item xs={6} lg={3}>
              <BestArtist
                timeSplit={timeSplit}
                start={start}
                end={end}
                loaded={this.loaded}
              />
            </Grid>
            <Grid style={{ minHeight: '250px' }} item xs={12} lg={6}>
              <TimePer
                loaded={this.loaded}
                start={start}
                end={end}
                timeSplit={timeSplit}
              />
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
