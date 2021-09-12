import React, { useCallback, useState } from 'react';
import { useSelector } from 'react-redux';
import { Typography, Grid, useMediaQuery } from '@material-ui/core';
import cl from 'classnames';
import s from './index.module.css';
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
import QuickInterval from '../../components/QuickInterval';
import { lessThanMobile } from '../../services/theme';
import Divider from '../../components/Divider';
import { selectUser } from '../../services/redux/selector';

function Home() {
  const user = useSelector(selectUser);
  const [inter, setInter] = useState(lastDay());
  const [timeSplit, setTimeSplit] = useState('hour');

  const mobile = useMediaQuery(lessThanMobile);

  const changeTimesplit = useCallback(newTimeSplit => {
    setTimeSplit(newTimeSplit);
  }, []);

  const isLoaded = true;

  return (
    <div>
      <div className={isLoaded ? s.welcome : s.welcomehidden}>
        <Typography variant="h4">
          Welcome&nbsp;
          <span className={s.username}>{user.username}</span>
          {!mobile && ' here is your summary'}
        </Typography>
        <div>
          <QuickInterval
            defaultTab={0}
            interval={inter}
            timeSplit={timeSplit}
            onChangeInterval={setInter}
            onChangeTimesplit={changeTimesplit}
          />
        </div>
      </div>
      <Divider />
      <div className={cl(s.content, isLoaded ? s.content : s.contenthidden)}>
        <Grid container spacing={2} alignContent="stretch">
          <Grid container item xs={12} lg={6} spacing={0}>
            <Grid item xs={12} lg={6}>
              <div className={s.firstleft}>
                <SongsPerCard
                  start={inter.start}
                  end={inter.end}
                />
              </div>
            </Grid>
            <Grid item xs={12} lg={6}>
              <div className={s.secondleft}>
                <DifferentArtists
                  start={inter.start}
                  end={inter.end}
                />
              </div>
            </Grid>
            <Grid item xs={12}>
              <div>
                <TimePerCard
                  start={inter.start}
                  end={inter.end}
                />
              </div>
            </Grid>
          </Grid>

          <Grid item xs={12} lg={6}>
            <BestArtists
              className={s.minHeight}
              start={inter.start}
              end={inter.end}
            />
          </Grid>

          <Grid item xs={6} lg={3}>
            <BestSong
              start={inter.start}
              end={inter.end}
            />
          </Grid>
          <Grid item xs={6} lg={3}>
            <BestArtist
              start={inter.start}
              end={inter.end}
            />
          </Grid>
          <Grid item xs={12} lg={6}>
            <TimePer
              className={s.minHeight}
              start={inter.start}
              end={inter.end}
              timeSplit={timeSplit}
            />
          </Grid>
        </Grid>
      </div>
      <ShowIfInScreen>
        <hr className={s.divider} />
        <div className={s.listened}>
          <History maxOld={inter.start} title="Your history for this period" xs={2} lg={4} />
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

export default Home;
