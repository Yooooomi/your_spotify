import React from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import { Grid, Typography } from '@material-ui/core';
import { connect } from 'react-redux';
import s from './index.module.css';
import { mapStateToProps, mapDispatchToProps } from '../../../services/redux/tools';
import Track from '../../Track';

class History extends React.Component {
  constructor(props) {
    super(props);

    this.maxOldEnd = false;
  }

  loadMore = async () => {
    const { user, addTracks } = this.props;

    await addTracks(user.tracks.length);
  }

  render() {
    const { user, maxOld } = this.props;
    const { tracks } = user;

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
        this.maxOldEnd = true;
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

    return (
      <div className={s.root}>
        <InfiniteScroll
          pageStart={0}
          loadMore={this.loadMore}
          hasMore={(maxOld && !this.maxOldEnd) || (!maxOld && !user.full)}
          loader={<div className="loader" key={0}>Loading ...</div>}
        >
          <Grid container spacing={2}>
            {
              displayTracks.map(e => (
                <Grid item xs={xs} md={md} lg={lg} key={e.played_at}>
                  <Track infos={e} track={e.track} />
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
