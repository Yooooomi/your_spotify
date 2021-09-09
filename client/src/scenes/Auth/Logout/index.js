import React, { useEffect } from 'react';
import { Redirect } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import urls from '../../../services/urls';
import API from '../../../services/API';
import { updateUser } from '../../../services/redux/reducer';

function Logout() {
  const dispatch = useDispatch();

  useEffect(() => {
    API.logout();
    dispatch(updateUser(null));
  }, [dispatch]);

  return (
    <Redirect to={urls.login} />
  );
}

export default Logout;
