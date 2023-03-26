import { MenuItem } from '@mui/material';
import { useCallback } from 'react';
import { setPlaylistContext } from '../../services/redux/modules/playlist/reducer';
import { useAppDispatch } from '../../services/redux/tools';
import { Track } from '../../services/types';
import s from './index.module.css';

interface TrackOptionsContentProps {
  onClose: () => void;
  track: Track;
}

export default function TrackOptionsContent({
  onClose,
  track,
}: TrackOptionsContentProps) {
  const dispatch = useAppDispatch();

  const add = useCallback(() => {
    onClose();
    dispatch(
      setPlaylistContext({
        type: 'single',
        songId: track.id,
      }),
    );
  }, [dispatch, onClose, track.id]);

  return (
    <MenuItem className={s.item} onClick={add}>
      Add to playlist
    </MenuItem>
  );
}
