import React, { useCallback } from 'react';
import { Tooltip, Paper } from '@material-ui/core';
import { useSelector } from 'react-redux';
import s from './index.module.css';
import API from '../../../../../services/API';
import SimpleArtistLine from '../../../../SimpleArtistLine';
import { selectUser } from '../../../../../services/redux/selector';
import { useAPICall } from '../../../../../services/hooks';
import { Timesplits } from '../../../../../services/stats';
import FullWidthHeightLoading from '../../../../FullWidthHeightLoading';

function BestArtist({ start, end }) {
  const user = useSelector(selectUser);
  const [stats] = useAPICall(API.mostListenedArtist, [start, end, Timesplits.ALL]);

  const getTooltip = useCallback(value => {
    if (user.settings.metricUsed === 'number') {
      return `You listened to this artist ${value} times`;
    }
    if (user.settings.metricUsed === 'duration') {
      return `You listened to this artist for ${Math.floor(value / 1000 / 60)} minutes`;
    }
    return '';
  }, [user]);

  if (!stats) return <FullWidthHeightLoading />;

  let name; let background; let
    counts;

  if (!stats.length || !stats[0].artists.length) {
    name = 'No data';
    background = '/no_data.png';
    counts = 0;
  } else {
    name = stats[0].artists[0].name;
    background = stats[0].artists[0].images[0].url;
    ([counts] = stats[0].counts);
  }

  return (
    <Paper className={s.root} style={{ backgroundImage: `url(${background})` }}>
      <Tooltip
        arrow
        placement="bottom"
        enterDelay={250}
        title={getTooltip(counts)}
      >
        <div className={s.content}>
          <div className={s.text}>
            <div className={s.desc}>Best artist</div>
            <div className={s.title}>
              {counts > 0 && <SimpleArtistLine artist={stats[0].artists[0]} />}
              {counts === 0 && name}
            </div>
          </div>
        </div>
      </Tooltip>
    </Paper>
  );
}

export default BestArtist;
