import React from 'react';
import BasicCard from '../../../../../components/Stats/Cards/Normal/BasicCard';
import s from './index.module.css';

class MostListened extends BasicCard {
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

  getTop = () => 'Favorite tracks'

  getValue = () => {
    const { mostListened } = this.props;

    return (
      <div className={s.root}>
        {mostListened.map((e, k) => (
          <div key={e.track.id} className={s.container} style={{ fontSize: `${1 - k * 0.25}em` }}>
            <span className={s.rank}>{k + 1}</span>
            <span className={s.title}>
              <div>
                {e.track.name}
              </div>
              <div>
                listened&nbsp;
                {e.count}
                &nbsp;times
              </div>
            </span>
          </div>
        ))}
      </div>
    );
  }

  getBottom = () => null;
}

export default MostListened;
