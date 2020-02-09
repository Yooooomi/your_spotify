import React from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import { connect } from 'react-redux';
import { Grid } from '@material-ui/core';
import s from './index.module.css';
import { mapStateToProps, mapDispatchToProps } from '../../services/redux/tools';
import API from '../../services/API';
import History from '../../components/Stats/History';

class HistoryScene extends React.Component {
  componentDidMount = () => {
    const start = new Date();
    start.setDate(start.getDate() - 5);
    const end = new Date();
    end.setDate(end.getDate() + 2);

    API.mostListened(start, end).then(({ data }) => console.log(data));
    API.mostListenedArtist(start, end).then(({ data }) => console.log(data));
    API.listened_to(start, end).then(({ data }) => console.log(data));
    API.songsPer(start, end).then(({ data }) => console.log(data));
    API.timePer(start, end).then(({ data }) => console.log(data));
    API.featRatio(start, end).then(({ data }) => console.log(data));
    API.albumDateRatio(start, end).then(({ data }) => console.log(data));
    API.popularityPer(start, end).then(({ data }) => console.log(data));
  }

  loadMore = () => {
    const { user, addTracks } = this.props;

    addTracks(user.tracks.length);
  }

  render() {
    const { user } = this.props;

    return (
      <div className={s.root}>
        <InfiniteScroll
          pageStart={0}
          loadMore={this.loadMore}
          hasMore={!user.full}
          loader={<div className="loader" key={0}>Loading ...</div>}
        >
          <Grid container spacing={1}>
            <History />
          </Grid>
        </InfiniteScroll>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(HistoryScene);
