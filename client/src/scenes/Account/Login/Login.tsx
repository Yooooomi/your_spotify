import { Button, Input } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { selectUser } from '../../../services/redux/modules/user/selector';
import { login as loginThunk } from '../../../services/redux/modules/user/thunk';
import s from '../index.module.css';

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [navigate, user]);

  const login = useCallback(
    async (ev: React.SyntheticEvent) => {
      ev.preventDefault();
      await dispatch(loginThunk({ username, password }));
    },
    [dispatch, password, username],
  );

  return (
    <div className={s.root}>
      <form onSubmit={login} className={s.form}>
        <h1>Login</h1>
        <Input
          placeholder="Username"
          value={username}
          onChange={(ev) => setUsername(ev.target.value)}
        />
        <Input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(ev) => setPassword(ev.target.value)}
        />
        <div>
          <div className={s.button}>
            <Button type="submit" variant="contained">
              Login
            </Button>
          </div>
          <Link to="/register">Register instead</Link>
        </div>
      </form>
    </div>
  );
}
