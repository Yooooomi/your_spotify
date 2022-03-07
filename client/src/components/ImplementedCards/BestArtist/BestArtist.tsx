import React from 'react';
import clsx from 'clsx';
import { useSelector } from 'react-redux';
import { Skeleton } from '@mui/material';
import { api } from '../../../services/api';
import { useAPI } from '../../../services/hooks';
import { msToMinutes } from '../../../services/stats';
import { getImage } from '../../../services/tools';
import TitleCard from '../../TitleCard';
import { ImplementedCardProps } from '../types';
import s from './index.module.css';
import InlineArtist from '../../InlineArtist';
import { selectInterval } from '../../../services/redux/modules/user/selector';

interface BestArtistProps extends ImplementedCardProps {}

export default function BestArtist({ className }: BestArtistProps) {
  const interval = useSelector(selectInterval);
  const result = useAPI(api.getBestArtists, interval.start, interval.end, 1, 0);

  if (!result) {
    return (
      <TitleCard title="Best artist" className={clsx(s.root, className)}>
        <div className={s.container}>
          <div className={s.imgcontainer}>
            <Skeleton className={clsx(s.image, s.skeleton)} variant="rectangular" height="100%" />
          </div>
          <div className={s.stats}>
            <Skeleton width="40%" />
            <div className={s.statnumbers}>
              <span className={s.stat}>
                <Skeleton width="60%" />
              </span>
              <span className={s.stat}>
                <Skeleton width="50%" />
              </span>
            </div>
          </div>
        </div>
      </TitleCard>
    );
  }

  const res = result[0];

  return (
    <TitleCard title="Best artist" className={clsx(s.root, className)} fade>
      <div className={s.container}>
        <div className={s.imgcontainer}>
          <img className={s.image} src={getImage(res?.artist)} alt="Your best artist" />
        </div>
        <div className={s.stats}>
          <strong>
            {res && <InlineArtist artist={res.artist} />}
            {!res && <span>No data</span>}
          </strong>
          <div className={s.statnumbers}>
            <span className={s.stat}>
              <strong>{res?.count ?? 0}</strong> songs listened
            </span>
            <span className={s.stat}>
              <strong>{msToMinutes(res?.duration_ms ?? 0)}</strong> minutes listened
            </span>
            <span className={s.stat}>
              <strong>{res?.differents ?? 0}</strong> different songs
            </span>
          </div>
        </div>
      </div>
    </TitleCard>
  );
}
