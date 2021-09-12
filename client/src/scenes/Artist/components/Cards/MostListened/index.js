import React, { useMemo, useState } from 'react';
import MoreIcon from '@material-ui/icons/Add';
import LessIcon from '@material-ui/icons/Remove';
import cl from 'classnames';
import { IconButton } from '@material-ui/core';
import PlayButton from '../../../../../components/PlayButton';
import BasicCard from '../../../../../components/Stats/Cards/Normal/BasicCard';
import s from './index.module.css';

function MostListened({ mostListened }) {
  const [open, setOpen] = useState(false);

  const top = useMemo(() => 'Favorite tracks', []);

  const value = useMemo(() => (
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
        <IconButton onClick={() => setOpen(!open)}>
          {open ? <LessIcon fontSize="small" /> : <MoreIcon fontSize="small" />}
        </IconButton>
      </div>
      <div className={cl(s.expand, open && s.expanded)}>
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
    </div>
  ), [mostListened, open]);

  return (
    <BasicCard
      top={top}
      value={value}
    />
  );
}

export default MostListened;
