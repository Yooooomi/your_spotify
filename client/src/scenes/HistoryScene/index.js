import React from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import { connect } from 'react-redux';
import { Grid } from '@material-ui/core';
import s from './index.module.css';
import { mapStateToProps, mapDispatchToProps } from '../../services/redux/tools';
import API from '../../services/API';
import History from '../../components/Stats/History';

class HistoryScene extends React.Component {
  loadMore = () => {
    const { user, addTracks } = this.props;

    addTracks(user.tracks.length);
  }

  render() {
    const { user } = this.props;

    return (
      <div className={s.root}>
        <Grid container spacing={1}>
          <History />
        </Grid>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(HistoryScene);
