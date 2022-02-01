import { CircularProgress } from '@material-ui/core';
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectLoaded, selectUser } from '../../services/redux/modules/user/selector';

interface PrivateRouteProps {
  needSpotify?: boolean;
  children: JSX.Element;
}

export default function PrivateRoute({ needSpotify, children }: PrivateRouteProps): JSX.Element {
  const user = useSelector(selectUser);
  const loaded = useSelector(selectLoaded);
  const navigate = useNavigate();

  useEffect(() => {
    if (loaded && !user) {
      navigate('/login');
    }
    if (!user) {
      return;
    }
    if (loaded && needSpotify && !user.activated) {
      navigate('/login-spotify');
    }
  }, [loaded, navigate, needSpotify, user]);

  if (!loaded) {
    return <CircularProgress />;
  }
  if (!user) {
    return <div />;
  }
  return children;
}
