import React from 'react';
import cl from 'classnames';
import { PlayCircleOutline } from '@material-ui/icons';
import { IconButton, Paper } from '@material-ui/core';
import s from './index.module.css';
import API from '../../services/API';
import Line from './Line';
import SimpleArtistLine from '../SimpleArtistLine';

class Track extends React.Component {
  play = async () => {
    const { track } = this.props;

    await API.play(track.id);
  }

  line = () => (
    <Line {...this.props} />
  )

  render() {
    const { className, track, line } = this.props;

    if (line) {
      return this.line();
    }

    return (
      <Paper className={cl(s.root, className)}>
        <div className={s.cover}>
          <img alt="album" src={track.full_album.images[0].url} />
        </div>
        <div className={s.bottom}>
          <div className={s.texts}>
            <div className={s.title}>
              {track.name}
            </div>
            <div className={s.author}>
              <SimpleArtistLine artist={track.full_artist[0]} />
            </div>
          </div>
          <div className={s.play}>
            <IconButton
              onClick={this.play}
              disableRipple
              disableFocusRipple
              disableTouchRipple
              className={s.playButton}
            >
              <PlayCircleOutline fontSize="small" />
            </IconButton>
          </div>
        </div>
      </Paper>
    );
  }
}

export default Track;
