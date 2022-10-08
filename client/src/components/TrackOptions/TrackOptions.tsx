import React, { useCallback, useRef, useState } from 'react';
import { IconButton, MenuItem, Popover } from '@mui/material';
import { MoreHoriz } from '@mui/icons-material';
import { Track } from '../../services/types';
import s from './index.module.css';
import { useAppDispatch } from '../../services/redux/tools';
import { setPlaylistContext } from '../../services/redux/modules/playlist/reducer';
import { useIsGuest } from '../../services/hooks';

interface TrackOptionsProps {
  track: Track;
}

export const TRACK_OPTIONS_WIDTH = 34;

export default function TrackOptions({ track }: TrackOptionsProps) {
  const ref = useRef(null);
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(false);
  const isGuest = useIsGuest();

  const add = useCallback(() => {
    setOpen(false);
    dispatch(
      setPlaylistContext({
        type: 'single',
        songId: track.id,
      }),
    );
  }, [dispatch, track.id]);

  if (isGuest) {
    return <div className={s.guest} />;
  }

  return (
    <>
      <IconButton
        ref={ref}
        size="small"
        onClick={() => setOpen(true)}
        disableRipple>
        <MoreHoriz fontSize="small" />
      </IconButton>
      <Popover
        open={open}
        onClose={() => setOpen(false)}
        anchorEl={ref.current}
        PaperProps={{ className: s.root }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}>
        <strong>{track.name}</strong>
        <MenuItem className={s.item} onClick={add}>
          Add to playlist
        </MenuItem>
      </Popover>
    </>
  );
}
