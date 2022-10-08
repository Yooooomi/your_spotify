import { PlayArrow } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import clsx from 'clsx';
import { useCallback } from 'react';
import { playTrack } from '../../services/redux/modules/user/thunk';
import { useAppDispatch } from '../../services/redux/tools';
import { getAtLeastImage } from '../../services/tools';
import { SpotifyImage } from '../../services/types';
import s from './index.module.css';

interface PlayButtonProps {
  id: string;
  covers: SpotifyImage[];
  className?: string;
}

export default function PlayButton({ id, covers, className }: PlayButtonProps) {
  const dispatch = useAppDispatch();

  const play = useCallback(() => {
    dispatch(playTrack(id));
  }, [dispatch, id]);

  return (
    <div className={clsx(s.root, className)}>
      <img src={getAtLeastImage(covers, 48)} alt="cover" className={s.image} />
      <IconButton onClick={play} className={s.button}>
        <PlayArrow className={s.icon} fontSize="large" />
      </IconButton>
    </div>
  );
}
