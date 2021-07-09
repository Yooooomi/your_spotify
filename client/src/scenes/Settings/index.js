import React, { useCallback, useState } from 'react';
import {
  Paper, Typography, Grid, Button, Slider, Tabs, Tab, CircularProgress,
} from '@material-ui/core';
import { connect } from 'react-redux';
import s from './index.module.css';
import { mapStateToProps, mapDispatchToProps } from '../../services/redux/tools';
import API from '../../services/API';
import SettingField from './SettingField';
import Divider from '../../components/Divider';

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

function Settings({
  user,
  refreshUser,
  globalPreferences,
  updateGlobalPreferences,
}) {
  const [metric, setMetric] = useState(user.settings.metricUsed);

  const allowRegistrations = useCallback(async () => {
    try {
      const { data: newPrefs } = await API
        .setGlobalPreferences({ allowRegistrations: !globalPreferences.allowRegistrations });
      window.message('info', `Changed your registration status to ${!globalPreferences.allowRegistrations}`);
      updateGlobalPreferences(newPrefs);
    } catch (e) {
      window.message('error', 'Could not change the status of the registration');
    }
  }, [globalPreferences, updateGlobalPreferences]);

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
      refreshUser();
      window.message('info', `Successfully set metric used to ${value}`);
    } catch (e) {
      window.message('error', 'Could not change the metric used');
    }
  }, [refreshUser]);

  if (user == null) return <CircularProgress />;

  return (
    <div className={s.root}>
      <Typography variant="h4" align="left">Settings</Typography>
      <Divider />
      <Grid container spacing={2}>
        <Grid item xs={12} lg={6}>
          <Paper className={s.paper}>
            <div>
              <Typography variant="h5" align="left">Account infos</Typography>
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
              <Typography variant="h5" align="left">Spotify infos</Typography>
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
        <Grid item xs={12}>
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

export default connect(mapStateToProps, mapDispatchToProps)(Settings);
