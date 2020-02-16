import React from 'react';
import { connect } from 'react-redux';
import { Redirect, Route } from 'react-router-dom';
import { mapStateToProps, mapDispatchToProps } from '../../services/redux/tools';
import urls from '../../services/urls';

class PrivateRoute extends React.Component {
  render() {
    const {
      ready, user, spotify, ...other
    } = this.props;

    if (ready && user) {
      if (!spotify || (spotify && user.activated)) {
        return <Route {...other} />;
      }
      return <Redirect to={urls.activateSpotify} />;
    }
    if (!ready) return null;
    return <Redirect to={urls.login} />;
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(PrivateRoute);
