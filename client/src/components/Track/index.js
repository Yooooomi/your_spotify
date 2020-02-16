import React from 'react';
import cl from 'classnames';
import { PlayCircleOutline } from '@material-ui/icons';
import { IconButton } from '@material-ui/core';
import s from './index.module.css';
import API from '../../services/API';

class Track extends React.Component {
  play = async () => {
    const { track } = this.props;

    await API.play(track.id);
  }

  render() {
    const { className, track } = this.props;

    return (
      <div className={cl(s.root, className)}>
        <div className={s.cover}>
          <img alt="album" src={track.full_album.images[0].url} />
        </div>
        <div className={s.bottom}>
          <div className={s.texts}>
            <div className={s.title}>
              {track.name}
            </div>
            <div className={s.author}>
              {track.full_artist[0].name}
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
      </div>
    );
  }
}

export default Track;
