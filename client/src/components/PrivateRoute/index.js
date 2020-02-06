import React from 'react';
import s from './index.module.css';
import { connect } from 'react-redux';
import { mapStateToProps, mapDispatchToProps } from '../../services/redux/tools';
import { Redirect, Route } from 'react-router-dom';
import urls from '../../services/urls';

class PrivateRoute extends React.Component {
    render() {
        const { ready, user, ...other } = this.props;

        const Component = this.props.component;

        if (ready && user) return <Route {...other} />
        else if (!ready) return null;
        else return <Redirect to={urls.login} />
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(PrivateRoute);
