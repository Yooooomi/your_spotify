import React, { useCallback, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import {
  Typography, Paper, Tooltip,
} from '@material-ui/core';
import { useSelector } from 'react-redux';
import s from '../index.module.css';
import API from '../../../services/API';
import urls from '../../../services/urls';
import FilledInput from '../../../components/FilledInput';
import LoadButton from '../../../components/LoadButton';
import { selectGlobalPreferences } from '../../../services/redux/selector';

function Register() {
  const history = useHistory();
  const globalPreferences = useSelector(selectGlobalPreferences);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const register = useCallback(async ev => {
    ev.preventDefault();

    setLoading(true);

    try {
      await API.register(username, password);
      window.message('success', 'Successfully registered');
      history.push(urls.login);
    } catch (e) {
      setLoading(false);
      window.message('error', 'Could not register your account');
      console.error(e);
    }
  }, [username, password, history]);

  return (
    <div className={s.pageHolder}>
      <Paper className={s.root}>
        <form onSubmit={register}>
          <Typography variant="h5" className={s.title}>
            Register to
            <strong className={s.ys}>YourSpotify</strong>
          </Typography>
          <div className={s.fields}>
            <div className={s.field}>
              <span>Username</span>
              <FilledInput
                name="username"
                placeholder="Your username"
                onChange={ev => setUsername(ev.target.value)}
                value={username}
              />
            </div>
            <div className={s.field}>
              <span>Password</span>
              <FilledInput
                name="password"
                placeholder="Your password"
                onChange={ev => setPassword(ev.target.value)}
                value={password}
                type="password"
              />
            </div>
          </div>
          <div>
            <Tooltip title={globalPreferences?.allowRegistrations ? '' : 'Registrations are disabled'}>
              <div>
                <LoadButton
                  loading={loading}
                  disabled={!globalPreferences?.allowRegistrations}
                  fullWidth
                  variant="contained"
                  color="primary"
                  type="submit"
                >
                  Register
                </LoadButton>
              </div>
            </Tooltip>
            <div className={s.underButton}>
              <Link className={s.link} to={urls.login}>Login</Link>
            </div>
          </div>
        </form>
      </Paper>
    </div>
  );
}

export default Register;
