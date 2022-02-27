import { Button, CircularProgress, Grid } from '@mui/material';
import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import FullscreenCentered from '../../components/FullscreenCentered';
import Header from '../../components/Header';
import TitleCard from '../../components/TitleCard';
import { api } from '../../services/api';
import { useAPI } from '../../services/hooks';
import { selectSettings } from '../../services/redux/modules/settings/selector';
import { changeRegistrations } from '../../services/redux/modules/settings/thunk';
import { selectUser } from '../../services/redux/modules/user/selector';
import { getSpotifyLogUrl } from '../../services/tools';
import DeleteUser from './DeleteUser';
import Importer from './Importer';
import s from './index.module.css';
import Rename from './Rename';
import SetAdmin from './SetAdmin';
import SettingLine from './SettingLine';

export default function Settings() {
  const dispatch = useDispatch();
  const settings = useSelector(selectSettings);
  const sme = useAPI(api.sme);
  const user = useSelector(selectUser);

  const allowRegistration = useCallback(() => {
    if (!settings) {
      return;
    }
    dispatch(changeRegistrations(!settings.allowRegistrations));
  }, [dispatch, settings]);

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
          {user.admin && (
            <>
              <Grid item xs={12} md={12} lg={6}>
                <TitleCard
                  title="Set admin status"
                  right={<span className={s.onlyadmin}>Only admins can see this</span>}>
                  <SetAdmin />
                </TitleCard>
              </Grid>
              <Grid item xs={12} md={12} lg={6}>
                <TitleCard
                  title="Delete users"
                  right={<span className={s.onlyadmin}>Only admins can see this</span>}>
                  <DeleteUser />
                </TitleCard>
              </Grid>
            </>
          )}
          <Grid item xs={12} md={12} lg={6}>
            <TitleCard title="Miscellaneous">
              {user.admin && (
                <SettingLine
                  left={
                    <span>
                      Allow new registrations&nbsp;
                      <span className={s.onlyadmin}>admin</span>
                    </span>
                  }
                  right={
                    <Button onClick={allowRegistration}>
                      {settings.allowRegistrations ? 'YES' : 'NO'}
                    </Button>
                  }
                />
              )}
              <SettingLine
                left="Relog to Spotify"
                right={
                  <Button>
                    <a href={getSpotifyLogUrl()}>Relog</a>
                  </Button>
                }
              />
            </TitleCard>
          </Grid>
          <Grid item xs={12} md={12} lg={6}>
            <TitleCard title="Import data">
              <Importer />
            </TitleCard>
          </Grid>
          <Grid item xs={12} md={12} lg={6}>
            <TitleCard title="Rename account">
              <Rename />
            </TitleCard>
          </Grid>
        </Grid>
      </div>
    </div>
  );
}
