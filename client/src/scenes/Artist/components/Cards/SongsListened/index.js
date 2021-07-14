import React from 'react';
import BasicCard from '../../../../../components/Stats/Cards/Normal/BasicCard';

class SongsListened extends BasicCard {
  constructor(props) {
    super(props);

    this.state = {
      ...this.state,
      stats: null,
      statsYesterday: null,
    };
  }

  refresh = () => null;

  isReady = () => true

  getTop = () => 'Songs listened'

  getValue = () => {
    const { total } = this.props;

    return (
      <div>
        {total.count}
      </div>
    );
  }

  getBottom = () => null;
}

export default SongsListened;
