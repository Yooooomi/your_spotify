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

function Line({ track, infos, header }) {
  const play = useCallback(async () => {
    await API.play(track.id);
  }, [track]);

  if (header) {
    track = {
      full_artist: [{ name: 'Artist' }],
      full_album: { name: 'Album', images: [{ url: '' }] },
      name: 'Track name',
    };
  }

  const isDownTablet = useMediaQuery(lessThanTablet);
  const isDownMobile = useMediaQuery(lessThanMobile);

  return (
    <Paper className={s.root}>
      <div className={cl(s.info, s.large)}>
        <div className={s.coverContainer}>
          <img
            style={{ opacity: header ? 0 : undefined }}
            src={track.full_album.images[0].url}
            className={s.cover}
            alt="album"
          />
        </div>
        {
          !header
          && (
            <IconButton
              onClick={play}
              disableRipple
              disableFocusRipple
              disableTouchRipple
              className={s.playButton}
            >
              <PlayCircleOutline fontSize="small" />
            </IconButton>
          )
        }
        <Typography noWrap>{track.name}</Typography>
      </div>
      <div className={cl(s.info, s.medium)}>
        <Typography noWrap>
          {track.full_artist.map((art, k, a) => (
            <React.Fragment key={art.id}>
              <SimpleArtistLine artist={art} key={art.id} />
              {k < a.length - 1 && ', '}
            </React.Fragment>
          ))}
        </Typography>
      </div>
      {!isDownTablet && (
        <div className={cl(s.info, s.little)}>
          <Typography noWrap>{track.full_album.name}</Typography>
        </div>
      )}
      {!isDownMobile && (
        <div className={cl(s.info, s.tiny)}>
          <Typography noWrap>{header ? 'Duration' : duration(track.duration_ms)}</Typography>
        </div>
      )}
      {!isDownMobile && (
        <div className={cl(s.info, s.lastInfo)}>
          <Typography noWrap>{header ? 'Played at' : formatHour(new Date(infos.played_at))}</Typography>
        </div>
      )}
    </Paper>
  );
}

export default Line;
