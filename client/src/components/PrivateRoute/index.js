import React from 'react';
import { connect } from 'react-redux';
import { Redirect, Route } from 'react-router-dom';
import { mapStateToProps, mapDispatchToProps } from '../../services/redux/tools';
import urls from '../../services/urls';

function PrivateRoute({
  ready,
  user,
  spotify,
  ...other
}) {
  if (ready && user) {
    if (!spotify || (spotify && user.activated)) {
      return <Route {...other} />;
    }
    return <Redirect to={urls.activateSpotify} />;
  }
  if (!ready) return null;
  return <Redirect to={urls.login} />;
}

export default connect(mapStateToProps, mapDispatchToProps)(PrivateRoute);
