import { Paper, useMediaQuery } from '@material-ui/core';
import React from 'react';
import cl from 'classnames';
import s from '../index.module.css';
import SimpleArtistLine from '../../../../components/SimpleArtistLine';
import { lessThanMobile } from '../../../../services/theme';
import { msToHoursAndMinutesString } from '../../../../services/operations';

function Artist({ className, header, ...props }) {
  let { infos } = props;
  const { rank } = props;
  let img;
  if (header) {
    img = null;
    infos = { artist: { name: 'Artist name', genres: ['Artist genre'] }, duration_ms: 'Duration', count: 'Count' };
  } else {
    img = infos.artist.images[0].url;
  }

  const mobile = useMediaQuery(lessThanMobile);

  return (
    <Paper className={cl(s.root, className)}>
      {img ? <img className={s.cover} alt="cover" src={img} /> : <div className={s.cover} />}
      <span className={s.rank}>
        #
        {rank}
      </span>
      <span className={s.normal}>
        {!header ? <SimpleArtistLine artist={infos.artist} /> : infos.artist.name}
      </span>
      {!mobile && (
        <span className={s.normal}>
          {infos.artist.genres?.join(', ') || ''}
        </span>
      )}
      {!mobile && (
        <span className={s.small}>
          {header && (
            <span>
              {infos.duration_ms}
              {' '}
              <span className={s.percent}>(%)</span>
            </span>
          )}
          {!header && (
            <div>
              {msToHoursAndMinutesString(infos.duration_ms)}
              &nbsp;
              <span className={s.percent}>
                (
                {Math.floor((infos.duration_ms / infos.total_duration_ms) * 100)}
                %)
              </span>
            </div>
          )}
        </span>
      )}
      <span className={s.small}>
        {infos.count}
        &nbsp;
        <span className={s.percent}>
          (
          {!header && Math.floor((infos.count / infos.total_count) * 100)}
          %)
        </span>
      </span>
    </Paper>
  );
}

export default Artist;
