import React, { useMemo } from 'react';
import BasicCard from '../../../../../components/Stats/Cards/Normal/BasicCard';
import { dateObjToMonthStringAndYear } from '../../../../../services/date';
import s from './index.module.css';

function BestPeriod({ bestPeriod }) {
  const top = useMemo(() => '2 most listened months', []);

  const value = useMemo(() => {
    const [best, secondBest] = bestPeriod;

    return (
      <div>
        <div>
          {dateObjToMonthStringAndYear(best._id)}
          &nbsp;-&nbsp;
          {best.count}
          &nbsp;songs
          <span className={s.percent}>
            {Math.floor((best.count / best.total) * 100)}
            % of total
          </span>
        </div>
        <div className={s.down} style={{ opacity: secondBest ? 1 : 0 }}>
          {secondBest && (
            <div>
              {dateObjToMonthStringAndYear(secondBest._id)}
              &nbsp;-&nbsp;
              {secondBest.count}
              &nbsp;songs
              <span className={s.percent}>
                {Math.floor((secondBest.count / secondBest.total) * 100)}
                % of total
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }, [bestPeriod]);

  return (
    <BasicCard
      top={top}
      value={value}
    />
  );
}

export default BestPeriod;
