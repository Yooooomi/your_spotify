import { PlayArrow } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import clsx from 'clsx';
import { useCallback } from 'react';
import { playTrack } from '../../services/redux/modules/user/thunk';
import { useAppDispatch } from '../../services/redux/tools';
import { SpotifyImage } from '../../services/types';
import IdealImage from '../IdealImage';
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
      <IdealImage
        images={covers}
        size={48}
        className={clsx('play-image', s.image)}
      />
      <IconButton onClick={play} className="play-button">
        <PlayArrow className={s.icon} />
      </IconButton>
    </div>
  );
}
