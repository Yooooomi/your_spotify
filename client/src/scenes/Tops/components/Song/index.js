import { Paper, useMediaQuery } from '@material-ui/core';
import React from 'react';
import cl from 'classnames';
import s from '../index.module.css';
import SimpleArtistLine from '../../../../components/SimpleArtistLine';
import PlayButton from '../../../../components/PlayButton';
import { lessThanMobile } from '../../../../services/theme';
import { msToHoursAndMinutesString } from '../../../../services/operations';

function Song({ className, header, ...props }) {
  let { infos, rank } = props;
  let img;
  if (header) {
    img = null;
    infos = { track: { name: 'Track name' }, artist: { name: 'Artist' }, duration_ms: 'Duration', count: 'Count' };
  } else {
    img = infos.album.images[0].url;
  }

  const mobile = useMediaQuery(lessThanMobile);

  return (
    <Paper className={cl(s.root, className)}>
      {img ? <img className={s.cover} alt="cover" src={img} /> : <div className={s.cover} />}
      <span className={s.rank}>
        #
        {rank}
      </span>
      <span className={s.play} style={{ opacity: header ? 0 : 1 }}>
        <PlayButton track={infos.track} />
      </span>
      <span className={s.normal}>
        {infos.track.name}
        {mobile && (
          <div className={s.littleArtist}>
            {!header ? <SimpleArtistLine artist={infos.artist} /> : infos.artist.name}
          </div>
        )}
      </span>
      {!mobile && (
        <span className={s.normal}>
          {!header ? <SimpleArtistLine artist={infos.artist} /> : infos.artist.name}
        </span>
      )}
      {!mobile && (
        <span className={s.small}>
          {header ? infos.duration_ms : msToHoursAndMinutesString(infos.duration_ms)}
          &nbsp;
          <span className={s.percent}>({!header && Math.floor(infos.duration_ms / infos.total_duration_ms * 100)}%)</span>
        </span>
      )}
      <span className={s.small}>
        {infos.count}
        &nbsp;
        <span className={s.percent}>({!header && Math.floor(infos.count / infos.total_count * 100)}%)</span>
      </span>
    </Paper>
  );
}

export default Song;
