import React from 'react';
import { Tooltip, Paper } from '@material-ui/core';
import s from './index.module.css';
import API from '../../../../../services/API';
import { useAPICall } from '../../../../../services/hooks';
import { Timesplits } from '../../../../../services/stats';
import FullWidthHeightLoading from '../../../../FullWidthHeightLoading';

function BestSong({ start, end }) {
  const [stats] = useAPICall(API.mostListened, [start, end, Timesplits.ALL]);

  if (!stats) return <FullWidthHeightLoading />;

  let name;
  let background;
  let counts;

  if (!stats.length || !stats[0].tracks.length) {
    name = 'No data';
    background = '/no_data.png';
    counts = 0;
  } else {
    name = stats[0].tracks[0].name;
    background = stats[0].tracks[0].album.images[0].url;
    ([counts] = stats[0].counts);
  }

  return (
    <Paper className={s.root} style={{ backgroundImage: `url(${background})` }}>
      <Tooltip
        arrow
        placement="bottom"
        enterDelay={250}
        title={`You listened to this song ${counts} times`}
      >
        <div className={s.content}>
          <div className={s.text}>
            <div className={s.desc}>Best song</div>
            <div className={s.title}>{name}</div>
          </div>
        </div>
      </Tooltip>
    </Paper>
  );
}

export default BestSong;
