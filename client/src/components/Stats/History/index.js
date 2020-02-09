import React from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import { Grid } from '@material-ui/core';
import { connect } from 'react-redux';
import s from './index.module.css';
import { mapStateToProps, mapDispatchToProps } from '../../../services/redux/tools';
import Track from '../../Track';

class History extends React.Component {
  constructor(props) {
    super(props);

    this.maxOldEnd = false;
  }

  loadMore = () => {
    const { user, addTracks } = this.props;

    addTracks(user.tracks.length);
  }

  render() {
    const { user, nb, maxOld } = this.props;
    const { tracks } = user;

    let xs = 3;
    let lg = 4

    if (xs) {
      xs = 12 / xs;
    }

    if (lg) {
      lg = 12 / lg;
    }

    let displayTracks = tracks;

    if (maxOld) {
      displayTracks = tracks.filter(tr => {
        const played = new Date(tr.played_at);
        if (played.getTime() > maxOld.getTime()) {
          return true;
        } else {
          this.maxOldEnd = true;
          return false;
        }
      });
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
                <Grid item xs={xs} lg={lg} key={e.played_at}>
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
