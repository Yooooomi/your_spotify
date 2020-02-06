import React from 'react';
import s from './index.module.css';
import InfiniteScroll from 'react-infinite-scroller';
import { connect } from 'react-redux';
import { mapStateToProps, mapDispatchToProps } from '../../services/redux/tools';
import Track from '../../components/Track';
import { Grid } from '@material-ui/core';
import API from '../../services/API';

class History extends React.Component {
    componentDidMount() {
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

    loadMore = (a, b, c) => {
        const { user, addTracks } = this.props;

        addTracks(user.tracks.length);
    }

    render() {
        const { user } = this.props;
        const { tracks } = user;

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
                            tracks.map((e, k) => (
                                <Grid item xs={4}>
                                    <Track infos={e} track={e.track} key={e.played_at} />
                                </Grid>
                            ))
                        }
                    </Grid>
                </InfiniteScroll>
            </div>
        )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(History);
