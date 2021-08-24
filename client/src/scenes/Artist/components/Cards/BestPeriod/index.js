import React from 'react';
import BasicCard from '../../../../../components/Stats/Cards/Normal/BasicCard';
import { dateObjToMonthStringAndYear, dateObjToString } from '../../../../../services/date';
import s from './index.module.css';

class BestPeriod extends BasicCard {
  constructor(props) {
    super(props);

    this.state = {
      ...this.state,
      stats: null,
      statsYesterday: null,
    };
  }

  refresh = () => null;

  isReady = () => true;

  getTop = () => '2 most listened months'

  getValue = () => {
    const { bestPeriod } = this.props;
    const [best, secondBest] = bestPeriod;

    return (
      <div>
        <div>
          {dateObjToMonthStringAndYear(best._id)}
          &nbsp;-&nbsp;
          {best.count}
          &nbsp;songs
          <span className={s.percent}>
            {Math.floor(best.count / best.total * 100)}
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
                {Math.floor(secondBest.count / secondBest.total * 100)}
                % of total
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }

  getBottom = () => null;
}

export default BestPeriod;
