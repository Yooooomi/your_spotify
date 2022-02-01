import React, { useMemo } from 'react';
import clsx from 'clsx';
import { api } from '../../../services/api';
import { useAPI } from '../../../services/hooks';
import { Timesplit } from '../../../services/types';
import TitleCard from '../../TitleCard';
import { ImplementedCardProps } from '../types';
import s from '../index.module.css';
import { getLastPeriod, getPercentMore } from '../../../services/stats';

interface ArtistsListenedProps extends ImplementedCardProps {}

export default function ArtistsListened({ interval, className }: ArtistsListenedProps) {
  const result = useAPI(api.differentArtistsPer, interval.start, interval.end, Timesplit.all);
  const lastPeriod = useMemo(() => getLastPeriod(interval.start, interval.end), [interval]);
  const resultOld = useAPI(
    api.differentArtistsPer,
    lastPeriod.start,
    lastPeriod.end,
    Timesplit.all,
  );

  if (!result || !resultOld || resultOld.length === 0 || result.length === 0) {
    return null;
  }

  const percentMore = getPercentMore(resultOld[0].differents, result[0].differents);

  return (
    <TitleCard title="Artists listened" className={className}>
      <div className={s.root}>
        <span className={s.number}>{result[0].differents} different</span>
        <span>
          <strong
            className={clsx({
              [s.more]: percentMore >= 0,
              [s.less]: percentMore < 0,
            })}>
            {Math.abs(percentMore)}%
          </strong>
          &nbsp;{percentMore < 0 ? 'less' : 'more'} than last period
        </span>
      </div>
    </TitleCard>
  );
}
