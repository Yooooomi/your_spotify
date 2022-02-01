import clsx from 'clsx';
import React from 'react';
import { api } from '../../../services/api';
import { useAPI } from '../../../services/hooks';
import { msToMinutes } from '../../../services/stats';
import { getImage } from '../../../services/tools';
import TitleCard from '../../TitleCard';
import { ImplementedCardProps } from '../types';
import s from './index.module.css';

interface BestArtistProps extends ImplementedCardProps {}

export default function BestArtist({ className, interval }: BestArtistProps) {
  const result = useAPI(api.getBestArtists, interval.start, interval.end, 1, 0);

  if (!result || result.length === 0) {
    return null;
  }

  return (
    <TitleCard title="Best artist" className={clsx(s.root, className)}>
      <div className={s.container}>
        <div className={s.imgcontainer}>
          <img className={s.image} src={getImage(result[0].artist)} alt="Your best artist" />
        </div>
        <div className={s.stats}>
          <strong>{result[0].artist.name}</strong>
          <div className={s.statnumbers}>
            <span className={s.stat}>
              <strong>{result[0].total_count}</strong> songs listened
            </span>
            <span className={s.stat}>
              <strong>{msToMinutes(result[0].total_duration_ms)}</strong> minutes listened
            </span>
          </div>
        </div>
      </div>
    </TitleCard>
  );
}
