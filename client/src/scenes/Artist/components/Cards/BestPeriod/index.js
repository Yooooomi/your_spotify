import React from 'react';
import BasicCard from '../../../../../components/Stats/Cards/Normal/BasicCard';
import { dateObjToString } from '../../../../../services/date';
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
          {dateObjToString(best._id)}
          &nbsp;-&nbsp;
          {best.count}
          &nbsp;songs
        </div>
        <div className={s.down} style={{ opacity: secondBest ? 1 : 0 }}>
          <span>
            {secondBest ? `${dateObjToString(secondBest._id)} - ${secondBest.count} songs` : ''}
          </span>
        </div>
      </div>
    );
  }

  getBottom = () => null;
}

export default BestPeriod;
