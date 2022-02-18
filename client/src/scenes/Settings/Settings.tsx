import { Button, CircularProgress, Grid, Input } from '@mui/material';
import React, { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import FullscreenCentered from '../../components/FullscreenCentered';
import Header from '../../components/Header';
import TitleCard from '../../components/TitleCard';
import { api } from '../../services/api';
import { useAPI } from '../../services/hooks';
import { alertMessage } from '../../services/redux/modules/message/reducer';
import { selectSettings } from '../../services/redux/modules/settings/selector';
import { changeRegistrations } from '../../services/redux/modules/settings/thunk';
import { selectUser } from '../../services/redux/modules/user/selector';
import { changePasswordForAccountId } from '../../services/redux/modules/user/thunk';
import { getSpotifyLogUrl } from '../../services/tools';
import Importer from './Importer';
import s from './index.module.css';
import SettingLine from './SettingLine';

export default function Settings() {
  const dispatch = useDispatch();
  const settings = useSelector(selectSettings);
  const [accountId, setAccountId] = useState('');
  const [passwordAccountId, setPasswordAccountId] = useState('');
  const sme = useAPI(api.sme);
  const userIds = useAPI(api.accountIds);
  const user = useSelector(selectUser);

  const allowRegistration = useCallback(() => {
    if (!settings) {
      return;
    }
    dispatch(changeRegistrations(!settings.allowRegistrations));
  }, [dispatch, settings]);

  const changeForAccountId = useCallback(
    (ev: React.SyntheticEvent) => {
      ev.preventDefault();
      if (passwordAccountId.length < 3) {
        dispatch(
          alertMessage({
            level: 'info',
            message: 'New password should have at least 3 characters',
          }),
        );
      }
      const id = accountId.length === 0 ? user?._id : accountId;
      if (!id) {
        return;
      }
      dispatch(
        changePasswordForAccountId({
          id,
          password: passwordAccountId,
        }),
      );
    },
    [accountId, dispatch, passwordAccountId, user],
  );

  if (!settings) {
    return (
      <FullscreenCentered>
        <CircularProgress />
        <h3>Your settings are loading</h3>
      </FullscreenCentered>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div>
      <Header
        title="Settings"
        subtitle="Here are the settings for Your Spotify, anyone with an account can access this page"
      />
      <div className={s.content}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={12} lg={6}>
            <TitleCard title="Account infos">
              <SettingLine left="Account ID" right={user._id} />
              <SettingLine left="Account name" right={user.username} />
              <SettingLine
                left="Account linked with Spotify"
                right={Boolean(user.activated).toString()}
              />
              <SettingLine
                left="Allow new registrations"
                right={settings.allowRegistrations.toString()}
              />
            </TitleCard>
          </Grid>
          {sme && (
            <Grid item xs={12} md={12} lg={6}>
              <TitleCard title="Linked Spotify account">
                <SettingLine left="Id" right={sme.id} />
                <SettingLine left="Mail" right={sme.email} />
                <SettingLine left="Product type" right={sme.product} />
              </TitleCard>
            </Grid>
          )}
          <Grid item xs={12} md={12} lg={6}>
            <TitleCard title="Change password for account ID">
              <form className={s.form} onSubmit={changeForAccountId}>
                <Input
                  fullWidth
                  placeholder="Account ID - empty changes yours"
                  value={accountId}
                  onChange={(ev) => setAccountId(ev.target.value)}
                />
                <Input
                  fullWidth
                  placeholder="New password for account ID"
                  value={passwordAccountId}
                  onChange={(ev) => setPasswordAccountId(ev.target.value)}
                />
                <Button type="submit">Change password</Button>
              </form>
              <h3>List of currently registered users</h3>
              <div className={s.ids}>
                {userIds?.map((us) => (
                  <SettingLine key={us.id} left={us.username} right={us.id} />
                ))}
              </div>
            </TitleCard>
          </Grid>
          <Grid item xs={12} md={12} lg={6}>
            <TitleCard title="Miscellaneous">
              <Button onClick={allowRegistration}>
                {settings.allowRegistrations
                  ? 'Disable new registrations'
                  : 'Enable new registrations'}
              </Button>
              <Button>
                <a href={getSpotifyLogUrl()}>Relog to Spotify</a>
              </Button>
            </TitleCard>
          </Grid>
          <Grid item xs={12} md={12} lg={6}>
            <TitleCard title="Import data">
              <Importer />
            </TitleCard>
          </Grid>
        </Grid>
      </div>
    </div>
  );
}
