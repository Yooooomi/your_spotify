import React, { useCallback, useState } from 'react';
import {
  Paper, Typography, Grid, Button, Slider, Tabs, Tab, CircularProgress, TextField, Tooltip,
} from '@material-ui/core';
import { useDispatch, useSelector } from 'react-redux';
import s from './index.module.css';
import API from '../../services/API';
import SettingField from './SettingField';
import Divider from '../../components/Divider';
import { selectGlobalPreferences, selectUser } from '../../services/redux/selector';
import { refreshUser } from '../../services/redux/thunks';
import { updateGlobalPreferences } from '../../services/redux/reducer';

const AccountFields = [
  { label: 'Account name', value: user => user.username },
  { label: 'Linked', value: user => user.activated },
  { label: 'Allow new registrations', value: (user, gconfig) => `${gconfig.allowRegistrations}` },
];

const SpotifyFields = [
  { label: 'Account mail', value: 'email' },
  { label: 'Account name', value: 'display_name' },
  { label: 'Location', value: 'country' },
  { label: 'Product type', value: 'product' },
];

function SpotifyFieldGetter(profile, fieldName) {
  const value = profile?.[fieldName];
  if (!value) {
    return `Could not retrieve ${fieldName}`;
  }
  return value;
}

function Settings() {
  const dispatch = useDispatch();

  const user = useSelector(selectUser);
  const globalPreferences = useSelector(selectGlobalPreferences);

  const [metric, setMetric] = useState(user.settings.metricUsed);
  const [oldPassword, setOldPassword] = useState('');
  const [oldPassword1, setOldPassword1] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const allowRegistrations = useCallback(async () => {
    try {
      const { data: newPrefs } = await API
        .setGlobalPreferences({ allowRegistrations: !globalPreferences.allowRegistrations });
      window.message('info', `Changed your registration status to ${!globalPreferences.allowRegistrations}`);
      dispatch(updateGlobalPreferences(newPrefs));
    } catch (e) {
      window.message('error', 'Could not change the status of the registration');
    }
  }, [dispatch, globalPreferences]);

  const changedNbElements = useCallback(async (ev, value) => {
    try {
      await API.setSetting('nbElements', value);
      window.message('info', `Successfully set number of elements to ${value}`);
    } catch (e) {
      window.message('error', 'Could not change the number of elements');
    }
  }, []);

  const changeMetric = useCallback(async (ev, value) => {
    try {
      await API.setSetting('metricUsed', value);
      setMetric(value);
      dispatch(refreshUser());
      window.message('info', `Successfully set metric used to ${value}`);
    } catch (e) {
      window.message('error', 'Could not change the metric used');
    }
  }, [dispatch]);

  const changePassword = useCallback(async ev => {
    ev.preventDefault();
    try {
      await API.changePassword(oldPassword, newPassword);
      window.message('success', 'Successfully changed your password');
    } catch (e) {
      window.message('error', 'Could not change the password');
    }
  }, [oldPassword, newPassword]);

  if (user == null) return <CircularProgress />;

  return (
    <div>
      <Typography variant="h4" align="left">Settings</Typography>
      <Divider />
      <Grid container spacing={2}>
        <Grid item xs={12} lg={6}>
          <Paper className={s.paper}>
            <div>
              <Typography className={s.title} variant="h5" align="left">Account infos</Typography>
              {
                AccountFields.map(field => (
                  <div className={s.entry} key={field.value}>
                    <Typography align="left">{field.label}</Typography>
                    <Typography
                      align="right"
                      className={s.value}
                    >
                      {field.value(user, globalPreferences).toString()}
                    </Typography>
                  </div>
                ))
              }
            </div>
          </Paper>
        </Grid>
        <Grid item xs={12} lg={6}>
          <Paper className={s.paper}>
            <div>
              <Typography className={s.title} variant="h5" align="left">Spotify infos</Typography>
              {
                user.activated ? (
                  SpotifyFields.map(field => (
                    <div className={s.entry} key={field.value}>
                      <Typography align="left">{field.label}</Typography>
                      <Typography align="right" className={s.value}>
                        {SpotifyFieldGetter(user.spotify, field.value)}
                      </Typography>
                    </div>
                  ))
                ) : (
                  <div>
                    <a style={{ textDecoration: 'none' }} href={`${window.API_ENDPOINT}/oauth/spotify`}>
                      <Button fullWidth variant="contained" color="primary">
                        Login to Spotify
                      </Button>
                    </a>
                  </div>
                )
              }
            </div>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper className={s.paper}>
            <SettingField
              title="Elements taken for 'best stats'"
              subtitle="Number of elements taken into
                &nbsp;account when displaying best related stats (best artists for example)"
            >
              <div>
                <Slider
                  min={5}
                  max={50}
                  step={5}
                  marks
                  valueLabelDisplay="auto"
                  defaultValue={user.settings.nbElements}
                  onChangeCommitted={changedNbElements}
                />
              </div>
            </SettingField>
            <SettingField
              title="Metric used for best stats"
              subtitle="Using number will count tracks listened to choose best artist
                &nbsp;/ album, duration will count total duration listened"
            >
              <div>
                <Tabs
                  style={{ width: 'min-content', marginLeft: 'auto' }}
                  value={metric}
                  onChange={changeMetric}
                >
                  {['number', 'duration'].map(e => <Tab value={e} label={e} key={e} />)}
                </Tabs>
              </div>
            </SettingField>
          </Paper>
        </Grid>
        <Grid item xs={6}>
          <Paper className={s.paper}>
            <form onSubmit={changePassword}>
              <div>
                <Typography className={s.title} variant="h5" align="left">Change password</Typography>
              </div>
              <div>
                <TextField
                  type="password"
                  value={oldPassword}
                  onChange={ev => setOldPassword(ev.target.value)}
                  fullWidth
                  className={s.changepasswordinput}
                  placeholder="Old password..."
                />
              </div>
              <div>
                <TextField
                  type="password"
                  value={oldPassword1}
                  onChange={ev => setOldPassword1(ev.target.value)}
                  fullWidth
                  className={s.changepasswordinput}
                  placeholder="Old password again..."
                />
              </div>
              <div>
                <TextField
                  type="password"
                  value={newPassword}
                  onChange={ev => setNewPassword(ev.target.value)}
                  fullWidth
                  className={s.changepasswordinput}
                  placeholder="New password..."
                />
              </div>
              <div>
                <Tooltip
                  title={oldPassword !== oldPassword1 ? 'All fields not set or old passwords differ' : ''}
                  className={s.changepasswordbutton}
                >
                  <div style={{ width: 'max-content' }}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      disabled={oldPassword !== oldPassword1 || oldPassword.length === 0}
                    >
                      Change password
                    </Button>
                  </div>
                </Tooltip>
              </div>
            </form>
          </Paper>
        </Grid>
        <Grid item xs={6}>
          <Paper className={s.footer}>
            <Grid container spacing={1}>
              <Grid item xs={6} lg={4}>
                <a style={{ textDecoration: 'none' }} href={`${window.API_ENDPOINT}/oauth/spotify`}>
                  <Button fullWidth variant="contained" color="primary">
                    Relog to Spotify
                  </Button>
                </a>
              </Grid>
              <Grid item xs={6} lg={4}>
                <Button fullWidth variant="contained" color="primary" onClick={allowRegistrations}>
                  {globalPreferences.allowRegistrations && 'Disable registrations'}
                  {!globalPreferences.allowRegistrations && 'Allow registrations'}
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
}

export default Settings;
