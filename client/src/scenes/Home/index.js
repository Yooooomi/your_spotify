import React, { useCallback, useMemo, useState } from 'react';
import { connect } from 'react-redux';
import { Typography, Grid, useMediaQuery } from '@material-ui/core';
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
import { lessThanMobile } from '../../services/theme';
import Divider from '../../components/Divider';

const NB_TO_BE_LOADED = 7;

function Home({ user }) {
  const [loaded, setLoadedArray] = useState(Array.from(Array(NB_TO_BE_LOADED).keys()).map(() => false));
  const [prefab, setPrefab] = useState(0);
  const [timeSplit, setTimeSplit] = useState('hour');

  const inter = useMemo(lastDay, []);
  const [start, setStart] = useState(inter.start);
  const [end, setEnd] = useState(inter.end);

  const mobile = useMediaQuery(lessThanMobile);

  const setLoaded = useCallback(idx => {
    loaded[idx] = true;
    setLoadedArray([...loaded]);
  }, [loaded]);

  const changePrefab = useCallback((ev, idx) => {
    const newPrefab = PrefabToInter[idx];

    const infos = newPrefab.fn();
    const { inter: newInter } = infos;

    setPrefab(idx);
    setTimeSplit(infos.timeSplit);
    setStart(newInter.start);
    setEnd(newInter.end);
  }, []);

  const changeTimesplit = useCallback(newTimeSplit => {
    setTimeSplit(newTimeSplit);
  }, []);

  const isLoaded = useMemo(() => !loaded.some(e => !e), [loaded]);

  return (
    <div className={s.root}>
      <div className={isLoaded ? s.welcome : s.welcomehidden}>
        <Typography align="left" variant="h4">
          Welcome&nbsp;
          <span className={s.username}>{user.username}</span>
          {!mobile && ' here is your summary'}
        </Typography>
        <div>
          <QuickInterval
            interval={prefab}
            timeSplit={timeSplit}
            onChangeInterval={changePrefab}
            onChangeTimesplit={changeTimesplit}
          />
        </div>
      </div>
      <Divider />
      <div className={cl(s.content, isLoaded ? s.content : s.contenthidden)}>
        <Grid container spacing={2} alignContent="stretch">
          <Grid container item xs={12} lg={6} spacing={0}>
            <Grid item xs={12} lg={6}>
              <div className={cl(s.left, s.firstleft)}>
                <SongsPerCard
                  user={user}
                  timeSplit={timeSplit}
                  start={start}
                  end={end}
                  loaded={() => setLoaded(0)}
                />
              </div>
            </Grid>
            <Grid item xs={12} lg={6}>
              <div className={cl(s.left, s.secondleft)}>
                <DifferentArtists
                  user={user}
                  timeSplit={timeSplit}
                  start={start}
                  end={end}
                  loaded={() => setLoaded(1)}
                />
              </div>
            </Grid>
            <Grid item xs={12}>
              <div>
                <TimePerCard
                  user={user}
                  timeSplit={timeSplit}
                  start={start}
                  end={end}
                  loaded={() => setLoaded(2)}
                />
              </div>
            </Grid>
          </Grid>

          <Grid item xs={12} lg={6}>
            <BestArtists
              user={user}
              className={s.minHeight}
              timeSplit={timeSplit}
              start={start}
              end={end}
              loaded={() => setLoaded(3)}
            />
          </Grid>

          <Grid item xs={6} lg={3}>
            <BestSong
              user={user}
              timeSplit={timeSplit}
              start={start}
              end={end}
              loaded={() => setLoaded(4)}
            />
          </Grid>
          <Grid item xs={6} lg={3}>
            <BestArtist
              user={user}
              timeSplit={timeSplit}
              start={start}
              end={end}
              loaded={() => setLoaded(5)}
            />
          </Grid>
          <Grid item xs={12} lg={6}>
            <TimePer
              user={user}
              className={s.minHeight}
              loaded={() => setLoaded(6)}
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

export default connect(mapStateToProps, mapDispatchToProps)(Home);
