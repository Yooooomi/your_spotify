import React from 'react';
import s from './index.module.css';
import { connect } from 'react-redux';
import { mapStateToProps, mapDispatchToProps } from '../../services/redux/tools';

class Home extends React.Component {
    render() {
        const { user } = this.props;

        return (
            <div className={s.root}>
                { user.username }
                <a href="http://localhost:8080/oauth/spotify">Spotify</a>
            </div>
        )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Home);
