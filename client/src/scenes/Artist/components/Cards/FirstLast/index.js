import React, { useMemo } from 'react';
import BasicCard from '../../../../../components/Stats/Cards/Normal/BasicCard';
import { formatDate } from '../../../../../services/date';
import s from './index.module.css';

function FirstLast({ firstLast }) {
  const top = useMemo(() => 'First and last time listened', []);

  const value = useMemo(() => {
    const { first, last } = firstLast;

    return (
      <div>
        <div className={s.result}>
          <span>
            {formatDate(new Date(first.played_at))}
          </span>
          <span>
            {first.track.name}
          </span>
        </div>
        <div className={s.sep}>
          -
        </div>
        <div className={s.result}>
          <span>
            {formatDate(new Date(last.played_at))}
          </span>
          <span>
            {last.track.name}
          </span>
        </div>
      </div>
    );
  }, [firstLast]);

  return (
    <BasicCard
      top={top}
      value={value}
    />
  );
}

export default FirstLast;
