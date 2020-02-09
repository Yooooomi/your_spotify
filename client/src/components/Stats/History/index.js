import React from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import { Grid } from '@material-ui/core';
import { connect } from 'react-redux';
import s from './index.module.css';
import { mapStateToProps, mapDispatchToProps } from '../../../services/redux/tools';
import Track from '../../Track';

class History extends React.Component {
    loadMore = () => {
      const { user, addTracks } = this.props;

      addTracks(user.tracks.length);
    }

    render() {
      const { user, nb } = this.props;
      const { tracks } = user;

      let xs = 4;

      if (nb) {
        xs = 12 / nb;
      }

      return (
        <div className={s.root}>
          <InfiniteScroll
            pageStart={0}
            loadMore={this.loadMore}
            hasMore={!user.full}
            loader={<div className="loader" key={0}>Loading ...</div>}
          >
            <Grid container spacing={1}>
              {
                tracks.map(e => (
                  <Grid item xs={xs} key={e.played_at}>
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
