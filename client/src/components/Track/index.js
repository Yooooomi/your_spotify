import React from 'react';
import cl from 'classnames';
import { Paper } from '@material-ui/core';
import s from './index.module.css';
import Line from './Line';
import SimpleArtistLine from '../SimpleArtistLine';
import PlayButton from '../PlayButton';

class Track extends React.Component {
  line = () => (
    <Line {...this.props} />
  )

  render() {
    const { className, track, line } = this.props;

    if (line) {
      return this.line();
    }

    return (
      <Paper className={cl(s.root, className)}>
        <div className={s.cover}>
          <img alt="album" src={track.full_album.images[0].url} />
        </div>
        <div className={s.bottom}>
          <div className={s.texts}>
            <div className={s.title}>
              {track.name}
            </div>
            <div className={s.author}>
              <SimpleArtistLine artist={track.full_artist[0]} />
            </div>
          </div>
          <div className={s.play}>
            <PlayButton track={track} />
          </div>
        </div>
      </Paper>
    );
  }
}

export default Track;
