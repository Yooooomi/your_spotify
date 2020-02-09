import React from 'react';
import { connect } from 'react-redux';
import { Redirect, Route } from 'react-router-dom';
import { mapStateToProps, mapDispatchToProps } from '../../services/redux/tools';
import urls from '../../services/urls';

class PrivateRoute extends React.Component {
  render() {
    const { ready, user, ...other } = this.props;

    if (ready && user) return <Route {...other} />;
    if (!ready) return null;
    return <Redirect to={urls.login} />;
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(PrivateRoute);
