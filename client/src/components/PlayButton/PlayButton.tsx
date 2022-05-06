import { PlayArrow } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import clsx from 'clsx';
import { useCallback } from 'react';
import { api } from '../../services/api';
import s from './index.module.css';

interface PlayButtonProps {
  id: string;
  className?: string;
}

export default function PlayButton({ id, className }: PlayButtonProps) {
  const play = useCallback(() => api.play(id), [id]);

  return (
    <IconButton size="small" onClick={play} className={clsx(s.root, className)}>
      <PlayArrow />
    </IconButton>
  );
}
