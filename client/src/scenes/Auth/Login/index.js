import React, { useCallback, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Paper, Typography } from '@material-ui/core';
import s from '../index.module.css';
import API from '../../../services/API';
import urls from '../../../services/urls';
import FilledInput from '../../../components/FilledInput';
import LoadButton from '../../../components/LoadButton';
import { updateReady, updateUser } from '../../../services/redux/reducer';

function Login() {
  const history = useHistory();
  const dispatch = useDispatch();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const login = useCallback(async ev => {
    ev.preventDefault();

    setLoading(true);
    let user;
    try {
      const { data } = await API.login(username, password);
      user = data.user;
    } catch (e) {
      window.message('error', 'Wrong username or password');
      console.error(e);
      setLoading(false);
      return;
    }
    try {
      const { data: spotify } = await API.sme();
      user.spotify = spotify;
    } catch (e) {
      user.spotify = {};
    }
    dispatch(updateUser(user));
    dispatch(updateReady(true));
    history.push(urls.home);
  }, [dispatch, username, password, history]);

  return (
    <div className={s.pageHolder}>
      <Paper className={s.root}>
        <form onSubmit={login}>
          <Typography variant="h5" className={s.title}>
            Login to
            <strong className={s.ys}>YourSpotify</strong>
          </Typography>
          <div className={s.fields}>
            <div className={s.field}>
              <span>Username</span>
              <FilledInput
                placeholder="Your username"
                name="username"
                onChange={ev => setUsername(ev.target.value)}
                value={username}
              />
            </div>
            <div className={s.field}>
              <span>Password</span>
              <FilledInput
                placeholder="Your password"
                name="password"
                onChange={ev => setPassword(ev.target.value)}
                value={password}
                type="password"
              />
            </div>
          </div>
          <div>
            <LoadButton
              loading={loading}
              color="primary"
              variant="contained"
              fullWidth
              type="submit"
            >
              Log in
            </LoadButton>
            <div className={s.underButton}>
              <Link className={s.link} to={urls.register}>Register</Link>
            </div>
          </div>
        </form>
      </Paper>
    </div>
  );
}

export default Login;
