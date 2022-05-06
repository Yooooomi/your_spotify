import { CircularProgress } from '@mui/material';
import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Text from '../../components/Text';
import { api } from '../../services/api';
import { logout } from '../../services/redux/modules/user/reducer';

export default function Logout() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    async function dologout() {
      dispatch(logout());
      try {
        await api.logout();
      } catch (e) {
        console.error(e);
      }
      navigate('/login');
    }
    dologout();
  }, [navigate, dispatch]);

  return (
    <div>
      <Text element="h3">You are being logged out</Text>
      <CircularProgress />
    </div>
  );
}
