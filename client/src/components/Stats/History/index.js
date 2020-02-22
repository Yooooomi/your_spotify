import React from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import { Grid, Typography, Tabs, Tab } from '@material-ui/core';
import { connect } from 'react-redux';
import s from './index.module.css';
import { mapStateToProps, mapDispatchToProps } from '../../../services/redux/tools';
import Track from '../../Track';
import Line from '../../Track/Line';
import API from '../../../services/API';
import { ViewHeadline as LineIcon, ViewModule as NotLineIcon } from '@material-ui/icons';
import { ToggleButton, ToggleButtonGroup } from '@material-ui/lab';

class History extends React.Component {
  constructor(props) {
    super(props);

    this.maxOldEnd = false;
  }

  loadMore = async () => {
    const { tracks, addTracks } = this.props;

    await addTracks(tracks.length);
  }

  changeStyle = (ev, index) => {
    if (index === null) return;
    const line = index === 0;

    const { refreshUser } = this.props;

    API.setSetting('historyLine', line).then(refreshUser);
  }

  render() {
    const { tracks, user, maxOld, title, full } = this.props;
    const { settings } = user;
    const line = settings.historyLine;

    const xs = 6;
    const md = 4;
    const lg = 3;

    let displayTracks = tracks;

    if (maxOld) {
      displayTracks = tracks.filter(tr => {
        const played = new Date(tr.played_at);
        if (played.getTime() > maxOld.getTime()) {
          return true;
        }
        if (!this.maxOldEnd) {
          this.maxOldEnd = true;
        }
        return false;
      });
    }

    if (user.full && displayTracks.length === 0) {
      return (
        <div className={s.root}>
          <Typography align="center" variant="h5">No songs to display</Typography>
        </div>
      );
    }

    const gridProps = line ? ({ xs: 12 }) : ({ xs, md, lg });

    return (
      <div className={s.root}>
        <div className={s.title}>
          <Typography variant="h4">{title}</Typography>
          <ToggleButtonGroup
            exclusive
            value={line ? 0 : 1}
            onChange={this.changeStyle}
          >
            <ToggleButton value={0}><LineIcon /></ToggleButton>
            <ToggleButton value={1}><NotLineIcon /></ToggleButton>
          </ToggleButtonGroup>
        </div>
        <InfiniteScroll
          pageStart={0}
          loadMore={this.loadMore}
          hasMore={(maxOld && !this.maxOldEnd) || (!maxOld && !full)}
          loader={<div className="loader" key={0}>Loading ...</div>}
        >
          <Grid container spacing={2}>
            <Grid item xs={12}>
              {line && <Line header />}
            </Grid>
            {
              displayTracks.map(e => (
                <Grid item {...gridProps} key={e.played_at}>
                  <Track line={line} className={s.trackitem} infos={e} track={e.track} />
                </Grid>
              ))
            }
          </Grid>
        </InfiniteScroll>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(History);
