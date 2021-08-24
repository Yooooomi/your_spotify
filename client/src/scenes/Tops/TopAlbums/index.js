import s from './index.module.css';
import { Typography, CircularProgress } from '@material-ui/core';
import { useCallback, useEffect, useState } from 'react';
import API from '../../../services/API';
import Album from '../components/Album';
import InfiniteScroll from 'react-infinite-scroller';
import QuickInterval from '../../../components/QuickInterval';
import { lastWeek } from '../../../services/interval';

const NB_ALBUMS = 20;

function TopAlbums() {
  const [albums, setAlbums] = useState([]);
  const [ended, setEnded] = useState(false);
  const [inter, setInter] = useState(lastWeek());

  const loadMore = useCallback(async () => {
    try {
      const { data } = await API.getBestAlbums(inter.start, inter.end, NB_ALBUMS, albums?.length || 0);
      setAlbums([...albums, ...data]);
      if (!ended && data.length !== NB_ALBUMS) {
        setEnded(true);
      }
    } catch (e) {
      console.error(e);
    }
  }, [albums, ended]);

  const changeInter = useCallback(value => {
    setAlbums([]);
    setInter(value);
  }, []);

  return (
    <div>
      <div className={s.title}>
        <Typography variant="h4" align="left">
          Top albums
        </Typography>
        <QuickInterval interval={inter} onChangeInterval={changeInter} defaultTab={1} />
      </div>
      <Album header className={s.album} />
      <InfiniteScroll
        pageStart={0}
        loadMore={loadMore}
        hasMore={!ended}
        loader={<CircularProgress key={0} />}
      >
        <div>
          {albums.map((album, k) => (
            <Album key={album._id} infos={album} className={s.album} rank={k + 1} />
          ))}
        </div>
      </InfiniteScroll>
    </div>
  )
}

export default TopAlbums;
