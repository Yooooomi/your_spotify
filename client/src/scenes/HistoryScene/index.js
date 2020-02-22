import React from 'react';
import { connect } from 'react-redux';
import s from './index.module.css';
import { mapStateToProps, mapDispatchToProps } from '../../services/redux/tools';
import History from '../../components/Stats/History';

class HistoryScene extends React.Component {
  loadMore = () => {
    const { user, addTracks } = this.props;

    addTracks(user.tracks.length);
  }

  render() {
    return (
      <div className={s.root}>
        <History title="All time history" />
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(HistoryScene);
