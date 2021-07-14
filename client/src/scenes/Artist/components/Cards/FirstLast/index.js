import React from 'react';
import BasicCard from '../../../../../components/Stats/Cards/Normal/BasicCard';
import { formatDate } from '../../../../../services/date';
import s from './index.module.css';

class FirstLast extends BasicCard {
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

  getTop = () => 'First and last time listened'

  getValue = () => {
    const { firstLast } = this.props;
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
  }

  getBottom = () => null;
}

export default FirstLast;
