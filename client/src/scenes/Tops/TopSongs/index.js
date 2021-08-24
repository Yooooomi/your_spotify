import s from './index.module.css';
import { Typography, CircularProgress, useMediaQuery } from '@material-ui/core';
import { useCallback, useEffect, useState } from 'react';
import API from '../../../services/API';
import Song from '../components/Song';
import InfiniteScroll from 'react-infinite-scroller';
import QuickInterval from '../../../components/QuickInterval';
import { lastWeek } from '../../../services/interval';

const NB_SONGS = 20;

function TopSongs() {
  const [songs, setSongs] = useState([]);
  const [ended, setEnded] = useState(false);
  const [inter, setInter] = useState(lastWeek());

  const loadMore = useCallback(async () => {
    try {
      const { data } = await API.getBestSongs(inter.start, inter.end, NB_SONGS, songs?.length || 0);
      setSongs([...songs, ...data]);
      if (!ended && data.length !== NB_SONGS) {
        setEnded(true);
      }
    } catch (e) {
      console.error(e);
    }
  }, [songs, ended]);

  const changeInter = useCallback(value => {
    setSongs([]);
    setInter(value);
  }, []);

  return (
    <div>
      <div className={s.title}>
        <Typography variant="h4" align="left">
          Top songs
        </Typography>
        <QuickInterval interval={inter} onChangeInterval={changeInter} defaultTab={1} />
      </div>
      <Song header className={s.song} />
      <InfiniteScroll
        pageStart={0}
        loadMore={loadMore}
        hasMore={!ended}
        loader={<CircularProgress key={0} />}
      >
        <div>
          {songs.map((song, k) => (
            <Song key={song._id} infos={song} className={s.song} rank={k + 1} />
          ))}
        </div>
      </InfiniteScroll>
    </div>
  )
}

export default TopSongs;
