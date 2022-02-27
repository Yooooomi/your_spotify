import { CircularProgress } from '@mui/material';
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectLoaded, selectUser } from '../../services/redux/modules/user/selector';

interface PrivateRouteProps {
  children: JSX.Element;
}

export default function PrivateRoute({ children }: PrivateRouteProps): JSX.Element {
  const user = useSelector(selectUser);
  const loaded = useSelector(selectLoaded);
  const navigate = useNavigate();

  useEffect(() => {
    if (loaded && !user) {
      navigate('/login');
    }
  }, [loaded, navigate, user]);

  if (!loaded) {
    return <CircularProgress />;
  }
  if (!user) {
    return <div />;
  }
  return children;
}
