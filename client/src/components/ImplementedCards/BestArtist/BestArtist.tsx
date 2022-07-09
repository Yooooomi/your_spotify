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
import { selectRawIntervalDetail } from '../../../services/redux/modules/user/selector';
import Text from '../../Text';

interface BestArtistProps extends ImplementedCardProps {}

export default function BestArtist({ className }: BestArtistProps) {
  const { interval } = useSelector(selectRawIntervalDetail);
  const result = useAPI(api.getBestArtists, interval.start, interval.end, 1, 0);

  if (!result) {
    return (
      <TitleCard title="Best artist" className={clsx(s.root, className)}>
        <div className={s.container}>
          <div className={s.imgcontainer}>
            <Skeleton
              className={clsx(s.image, s.skeleton)}
              variant="rectangular"
              height="100%"
            />
          </div>
          <div className={s.stats}>
            <Skeleton width="40%" />
            <div className={s.statnumbers}>
              <Text className={s.stat}>
                <Skeleton width="60%" />
              </Text>
              <Text className={s.stat}>
                <Skeleton width="50%" />
              </Text>
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
          <img
            className={s.image}
            src={getImage(res?.artist)}
            alt="Your best artist"
          />
        </div>
        <div className={s.stats}>
          <Text element="strong">
            {res && <InlineArtist artist={res.artist} />}
            {!res && <Text>No data</Text>}
          </Text>
          <div className={s.statnumbers}>
            <Text className={s.stat}>
              <Text element="strong">{res?.count ?? 0}</Text> songs listened
            </Text>
            <Text className={s.stat}>
              <Text element="strong">{msToMinutes(res?.duration_ms ?? 0)}</Text>{' '}
              minutes listened
            </Text>
            <Text className={s.stat}>
              <Text element="strong">{res?.differents ?? 0}</Text> different
              songs
            </Text>
          </div>
        </div>
      </div>
    </TitleCard>
  );
}
