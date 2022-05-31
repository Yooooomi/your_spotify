import { PlayArrow } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import clsx from 'clsx';
import { useCallback } from 'react';
import { playTrack } from '../../services/redux/modules/user/thunk';
import { useAppDispatch } from '../../services/redux/tools';
import s from './index.module.css';

interface PlayButtonProps {
  id: string;
  className?: string;
}

export default function PlayButton({ id, className }: PlayButtonProps) {
  const dispatch = useAppDispatch();

  const play = useCallback(() => {
    dispatch(playTrack(id));
  }, [dispatch, id]);

  return (
    <IconButton size="small" onClick={play} className={clsx(s.root, className)}>
      <PlayArrow />
    </IconButton>
  );
}
