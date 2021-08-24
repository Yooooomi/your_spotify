import React, { useCallback } from 'react';
import {
  Typography, Paper, IconButton, useMediaQuery,
} from '@material-ui/core';
import cl from 'classnames';
import { PlayCircleOutline } from '@material-ui/icons';
import { duration, formatHour } from '../../../services/date';
import s from './index.module.css';
import API from '../../../services/API';
import { lessThanMobile, lessThanTablet } from '../../../services/theme';
import SimpleArtistLine from '../../SimpleArtistLine';
import PlayButton from '../../PlayButton';

function Line({ track, infos, header }) {
  if (header) {
    track = {
      full_artist: [{ name: 'Artist' }],
      full_album: { name: 'Album', images: [{ url: '' }] },
      name: 'Track name',
    };
  }

  const isDownTablet = useMediaQuery(lessThanTablet);
  const isDownMobile = useMediaQuery(lessThanMobile);

  const artists = track.full_artist.map((art, k, a) => (
    <React.Fragment key={art.id}>
      <SimpleArtistLine artist={art} key={art.id} />
      {k < a.length - 1 && ', '}
    </React.Fragment>
  ));

  return (
    <Paper className={s.root}>
      <div className={s.coverContainer}>
        <img
          style={{ opacity: header ? 0 : undefined }}
          src={track.full_album.images[0].url}
          className={s.cover}
          alt="album"
        />
      </div>
      <div style={{ opacity: header ? 0 : 1 }}>
        <PlayButton small track={track} />
      </div>
      <div className={cl(s.info, s.medium)}>
        <Typography noWrap component="div" align="left">
          {track.name}
          {isDownTablet && (
            <div className={s.littleArtist}>
              {artists}
            </div>
          )}
        </Typography>
      </div>
      {!isDownTablet && (
        <div className={cl(s.info, s.medium)}>
          <Typography noWrap>
            {artists}
          </Typography>
        </div>
      )}
      <div className={cl(s.info, s.medium)}>
        <Typography noWrap align="left">{track.full_album.name}</Typography>
      </div>
      <div className={cl(s.info, s.tiny)}>
        <Typography noWrap>{header ? 'Duration' : duration(track.duration_ms)}</Typography>
      </div>
      {!isDownMobile && (
        <div className={cl(s.info, s.lastInfo)}>
          <Typography noWrap>{header ? 'Played at' : formatHour(new Date(infos.played_at))}</Typography>
        </div>
      )}
    </Paper>
  );
}

export default Line;
