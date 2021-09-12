import React, { useMemo } from 'react';
import UpIcon from '@material-ui/icons/ArrowDropUp';
import DownIcon from '@material-ui/icons/ArrowDropDown';
import { Link } from 'react-router-dom';
import s from './index.module.css';
import BasicCard from '../../../../../components/Stats/Cards/Normal/BasicCard';
import SimpleArtistLine from '../../../../../components/SimpleArtistLine';
import urls from '../../../../../services/urls';

function Rank({ rank, artists }) {
  const isReady = useMemo(() => {
    if (!rank) return false;
    return rank.results.map(e => e.id).every(e => !!artists[e]);
  }, [rank, artists]);

  const top = useMemo(() => (!isReady ? null : (
    <span>
      Artist ranking -
      <Link className={s.allrank} to={urls.topArtists}>View all</Link>
    </span>
  )), [isReady]);

  const value = useMemo(() => {
    if (!isReady) return null;
    let offset = 0;

    if (rank.isMax) offset -= 1;

    const rankNb = rank.index + 1;

    return (
      <div>
        <div className={s.up} style={{ opacity: !rank.isMax ? 1 : 0 }}>
          <span>
            <UpIcon />
          </span>
          <span>
            #
            {rankNb - 1}
            &nbsp;-&nbsp;
            {!rank.isMax && <SimpleArtistLine artist={artists[rank.results[0 + offset].id]} />}
          </span>
        </div>
        <div>
          #
          {rankNb}
          &nbsp;-&nbsp;
          {artists[rank.results[1 + offset].id].name}
        </div>
        <div className={s.down} style={{ opacity: !rank.isMin ? 1 : 0 }}>
          <span>
            <DownIcon />
          </span>
          <span>
            #
            {rankNb + 1}
            &nbsp;-&nbsp;
            {!rank.isMin && <SimpleArtistLine artist={artists[rank.results[2 + offset].id]} />}
          </span>
        </div>
      </div>
    );
  }, [artists, rank, isReady]);

  return (
    <BasicCard
      top={top}
      value={value}
    />
  );
}

export default Rank;
