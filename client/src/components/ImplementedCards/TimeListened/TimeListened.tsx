import React, { useMemo } from 'react';
import clsx from 'clsx';
import { Skeleton } from '@mui/material';
import { api } from '../../../services/api';
import { useAPI } from '../../../services/hooks';
import { Timesplit } from '../../../services/types';
import TitleCard from '../../TitleCard';
import { ImplementedCardProps } from '../types';
import s from '../index.module.css';
import { getLastPeriod, getPercentMore, msToMinutes } from '../../../services/stats';

interface TimeListenedProps extends ImplementedCardProps {}

export default function TimeListened({ interval, unit, className }: TimeListenedProps) {
  const result = useAPI(api.timePer, interval.start, interval.end, Timesplit.all);
  const lastPeriod = useMemo(() => getLastPeriod(interval.start, interval.end), [interval]);
  const resultOld = useAPI(api.timePer, lastPeriod.start, lastPeriod.end, Timesplit.all);

  if (!result || !resultOld) {
    return (
      <TitleCard title="Time listened" className={className}>
        <div className={s.root}>
          <span className={s.number}>
            <Skeleton width={50} />
          </span>
          <span>
            <Skeleton width={200} />
          </span>
        </div>
      </TitleCard>
    );
  }

  const count = result[0]?.count ?? 0;
  const oldCount = resultOld[0]?.count ?? 0;

  const percentMore = getPercentMore(oldCount, count);

  return (
    <TitleCard title="Time listened" className={className} fade>
      <div className={s.root}>
        <span className={s.number}>{msToMinutes(count)} minutes</span>
        <span>
          <strong
            className={clsx({
              [s.more]: percentMore >= 0,
              [s.less]: percentMore < 0,
            })}>
            {Math.abs(percentMore)}%
          </strong>
          &nbsp;{percentMore < 0 ? 'less' : 'more'} than last {unit}
        </span>
      </div>
    </TitleCard>
  );
}
