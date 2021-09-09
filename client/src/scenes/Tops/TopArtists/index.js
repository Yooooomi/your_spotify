import React, { useCallback, useState } from 'react';
import { Typography, CircularProgress } from '@material-ui/core';
import InfiniteScroll from 'react-infinite-scroller';
import s from './index.module.css';
import API from '../../../services/API';
import Artist from '../components/Artist';
import QuickInterval from '../../../components/QuickInterval';
import { lastWeek } from '../../../services/interval';

const NB_ARTISTS = 20;

function TopArtists() {
  const [artists, setArtists] = useState([]);
  const [ended, setEnded] = useState(false);
  const [inter, setInter] = useState(lastWeek());

  const loadMore = useCallback(async () => {
    try {
      const { data } = await API.getBestArtists(inter.start, inter.end, NB_ARTISTS, artists?.length || 0);
      setArtists([...artists, ...data]);
      if (!ended && data.length !== NB_ARTISTS) {
        setEnded(true);
      }
    } catch (e) {
      console.error(e);
    }
  }, [artists, ended, inter]);

  const changeInter = useCallback(value => {
    setArtists([]);
    setInter(value);
  }, []);

  return (
    <div>
      <div className={s.title}>
        <Typography variant="h4" align="left">
          Top artists
        </Typography>
        <QuickInterval interval={inter} onChangeInterval={changeInter} defaultTab={1} />
      </div>
      <Artist header className={s.artist} />
      <InfiniteScroll
        pageStart={0}
        loadMore={loadMore}
        hasMore={!ended}
        loader={<CircularProgress key={0} />}
      >
        <div>
          {artists.map((artist, k) => (
            <Artist key={artist._id} infos={artist} className={s.artist} rank={k + 1} />
          ))}
        </div>
      </InfiniteScroll>
    </div>
  );
}

export default TopArtists;
