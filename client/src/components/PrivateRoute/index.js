import React from 'react';
import { useSelector } from 'react-redux';
import { Redirect, Route } from 'react-router-dom';
import { selectReady, selectUser } from '../../services/redux/selector';
import urls from '../../services/urls';

function PrivateRoute({
  spotify,
  ...other
}) {
  const ready = useSelector(selectReady);
  const user = useSelector(selectUser);

  if (ready && user) {
    if (!spotify || (spotify && user.activated)) {
      return <Route {...other} />;
    }
    return <Redirect to={urls.activateSpotify} />;
  }
  if (!ready) return null;
  return <Redirect to={urls.login} />;
}

export default PrivateRoute;
