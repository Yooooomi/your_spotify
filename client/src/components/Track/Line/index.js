import React from 'react';
import { Typography, Paper, IconButton } from '@material-ui/core';
import cl from 'classnames';
import { PlayCircleOutline } from '@material-ui/icons';
import { duration, formatHour } from '../../../services/date';
import s from './index.module.css';
import API from '../../../services/API';

class Line extends React.Component {
  play = async () => {
    const { track } = this.props;

    await API.play(track.id);
  }

  render() {
    let { track } = this.props;
    const { infos, header } = this.props;

    if (header) {
      track = {
        full_artist: [{ name: 'Artist' }],
        full_album: { name: 'Album', images: [{ url: '' }] },
        name: 'Track name',
      };
    }

    return (
      <Paper className={s.root}>
        <div className={cl(s.info, s.large)}>
          <div className={s.coverContainer}>
            <img src={track.full_album.images[0].url} className={s.cover} alt="album" />
          </div>
          {
            !header
            && <IconButton
              onClick={this.play}
              disableRipple
              disableFocusRipple
              disableTouchRipple
              className={s.playButton}
            >
              <PlayCircleOutline fontSize="small" />
            </IconButton>
          }
          <Typography noWrap>{track.name}</Typography>
        </div>
        <div className={cl(s.info, s.medium)}>
          <Typography noWrap>{track.full_artist.map(art => art.name).join(', ')}</Typography>
        </div>
        <div className={cl(s.info, s.little)}>
          <Typography noWrap>{track.full_album.name}</Typography>
        </div>
        <div className={cl(s.info, s.tiny)}>
          <Typography noWrap>{header ? 'Duration' : duration(track.duration_ms)}</Typography>
        </div>
        <div className={cl(s.info, s.lastInfo)}>
          <Typography noWrap>{header ? 'Played at' : formatHour(new Date(infos.played_at))}</Typography>
        </div>
      </Paper>
    );
  }
}

export default Line;
