import React, { useCallback, useRef } from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import { CircularProgress, Grid, Typography } from '@material-ui/core';
import { useDispatch, useSelector } from 'react-redux';
import { ViewHeadline as LineIcon, ViewModule as NotLineIcon } from '@material-ui/icons';
import { ToggleButton, ToggleButtonGroup } from '@material-ui/lab';
import s from './index.module.css';
import Track from '../../Track';
import Line from '../../Track/Line';
import API from '../../../services/API';
import { selectTracks, selectUser } from '../../../services/redux/selector';
import { addTracks, refreshUser } from '../../../services/redux/thunks';

function History({ maxOld, title }) {
  const maxOldEnd = useRef(false);
  const user = useSelector(selectUser);
  const { tracks, full } = useSelector(selectTracks);
  const dispatch = useDispatch();

  const loadMore = useCallback(async (page) => dispatch(addTracks((page - 1) * 20)), [dispatch]);

  const changeStyle = useCallback(async (ev, index) => {
    if (index === null) return;
    const line = index === 0;

    try {
      await API.setSetting('historyLine', line);
      dispatch(refreshUser());
    } catch (e) {
      console.error(e);
    }
  }, [dispatch]);

  const { settings } = user;
  const line = settings.historyLine;

  const xs = 6;
  const md = 4;
  const lg = 3;

  let displayTracks = tracks;
  console.log(displayTracks);

  if (maxOld) {
    displayTracks = tracks.filter(tr => {
      const played = new Date(tr.played_at);
      if (played.getTime() > maxOld.getTime()) {
        return true;
      }
      if (!maxOldEnd.current) {
        maxOldEnd.current = true;
      }
      return false;
    });
  }

  const noSongs = full && displayTracks.length === 0;
  const gridProps = line ? ({ xs: 12 }) : ({ xs, md, lg });

  return (
    <div>
      <div className={s.title}>
        <Typography variant="h4">{title}</Typography>
        <ToggleButtonGroup
          exclusive
          value={line ? 0 : 1}
          onChange={changeStyle}
        >
          <ToggleButton value={0}><LineIcon /></ToggleButton>
          <ToggleButton value={1}><NotLineIcon /></ToggleButton>
        </ToggleButtonGroup>
      </div>
      {noSongs && (
        <div className={s.root}>
          <Typography align="center" variant="h5">No songs to display</Typography>
        </div>
      )}
      {!noSongs && (
        <InfiniteScroll
          pageStart={0}
          loadMore={loadMore}
          hasMore={(maxOld && !maxOldEnd.current && !full) || (!maxOld && !full)}
          loader={(
            <div className={s.loader} key={0}>
              <div className={s.loadercontent}>
                <CircularProgress size={16} />
                <span>Loading</span>
              </div>
            </div>
          )}
        >
          <div className={s.songs}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                {line && <Line header />}
              </Grid>
              {
                displayTracks.map(e => (
                  <Grid item {...gridProps} key={e.played_at}>
                    <Track line={line} infos={e} track={e.track} />
                  </Grid>
                ))
              }
            </Grid>
          </div>
        </InfiniteScroll>
      )}
    </div>
  );
}

export default History;
