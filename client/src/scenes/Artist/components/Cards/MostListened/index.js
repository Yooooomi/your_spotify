import React from 'react';
import MoreIcon from '@material-ui/icons/Add';
import LessIcon from '@material-ui/icons/Remove';
import cl from 'classnames';
import PlayButton from '../../../../../components/PlayButton';
import BasicCard from '../../../../../components/Stats/Cards/Normal/BasicCard';
import s from './index.module.css';
import { IconButton } from '@material-ui/core';

class MostListened extends BasicCard {
  constructor(props) {
    super(props);

    this.state = {
      ...this.state,
      stats: null,
      statsYesterday: null,
      open: false,
    };
  }

  refresh = () => null;

  isReady = () => true;

  getTop = () => 'Favorite tracks'

  getValue = () => {
    const { mostListened } = this.props;

    return (
      <div className={s.root}>
        {mostListened.slice(0, 3).map((e, k) => (
          <div key={e.track.id} className={s.container} style={{ fontSize: `${1 - k * 0.25}em` }}>
            <span className={s.rank}>{k + 1}</span>
            <span className={s.title}>
              <div>
                {e.track.name}
                <PlayButton track={e.track} className={s.play} nomargin />
              </div>
              <div>
                listened&nbsp;
                {e.count}
                &nbsp;times
              </div>
            </span>
          </div>
        ))}
        <div className={s.morebutton}>
          <IconButton onClick={() => this.setState({ open: !this.state.open })}>
            {this.state.open ? <LessIcon fontSize="small" /> : <MoreIcon fontSize="small" />}
          </IconButton>
        </div>
        <div className={cl(s.expand, this.state.open && s.expanded)}>
          {mostListened.slice(3).map((e, k) => (
            <div key={e.track.id} className={s.container} style={{ fontSize: `${1 - 2 * 0.25}em` }}>
              <span className={s.rank}>{k + 3 + 1}</span>
              <span className={s.title}>
                <div>
                  {e.track.name}
                  <PlayButton track={e.track} className={s.play} nomargin />
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
      </div >
    );
  }

  getBottom = () => null;
}

export default MostListened;
