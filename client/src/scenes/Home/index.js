import React from 'react';
import s from './index.module.css';
import { connect } from 'react-redux';
import { mapStateToProps, mapDispatchToProps } from '../../services/redux/tools';
import { Typography, Grid } from '@material-ui/core';
import TimeToday from '../../components/Stats/Cards/TimeToday';
import SongsToday from '../../components/Stats/Cards/SongsToday';
import History from '../../components/Stats/History';
import TimePer from '../../components/Stats/Graphs/TimePer';

class Home extends React.Component {
    render() {
        const { user } = this.props;

        return (
            <div className={s.root}>
                <div className={s.welcome}>
                    <Typography align="left" variant="h4">
                        Welcome&nbsp;
                    {user.username}
                    </Typography>
                </div>
                <Grid container spacing={2}>
                    <Grid item xs={6}>
                        <SongsToday />
                    </Grid>
                    <Grid item xs={6}>
                        <TimeToday />
                    </Grid>
                </Grid>
                <TimePer />
                <div className={s.welcome}>
                    <Typography align="left" variant="h4">
                        Recent play history
                    </Typography>
                </div>
                <History nb={4} />
                <a href="http://localhost:8080/oauth/spotify">Spotify</a>
            </div>
        )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Home);
