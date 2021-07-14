import React from 'react';
import UpIcon from '@material-ui/icons/ArrowDropUp';
import DownIcon from '@material-ui/icons/ArrowDropDown';
import s from './index.module.css';
import BasicCard from '../../../../../components/Stats/Cards/Normal/BasicCard';
import SimpleArtistLine from '../../../../../components/SimpleArtistLine';

class Rank extends BasicCard {
  constructor(props) {
    super(props);

    this.state = {
      ...this.state,
      stats: null,
      statsYesterday: null,
    };
  }

  refresh = () => null;

  isReady = () => {
    const { rank, artists } = this.props;
    if (!rank) return false;
    return rank.results.map(e => e.id).every(e => !!artists[e]);
  }

  getTop = () => 'Artist ranking'

  getValue = () => {
    const { rank, artists } = this.props;
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
  }

  getBottom = () => null;
}

export default Rank;
