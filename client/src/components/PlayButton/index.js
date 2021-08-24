import { IconButton } from '@material-ui/core';
import { PlayCircleOutline } from '@material-ui/icons';
import React, { useCallback } from 'react';
import cl from 'classnames';
import API from '../../services/API';
import s from './index.module.css';

function PlayButton({ track, nomargin, className }) {
  const play = useCallback(async () => {
    try {
      await API.play(track.id);
    } catch (e) {

    }
  }, [track]);

  return (
    <IconButton
      onClick={play}
      disableRipple
      disableFocusRipple
      disableTouchRipple
      className={cl(s.playButton, nomargin && s.nomargin, className)}
    >
      <PlayCircleOutline fontSize="small" />
    </IconButton>
  );
}

export default PlayButton;
