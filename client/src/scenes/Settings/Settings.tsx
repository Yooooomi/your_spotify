import { Button, CircularProgress, Grid } from '@mui/material';
import React, { useCallback } from 'react';
import { useSelector } from 'react-redux';
import FullscreenCentered from '../../components/FullscreenCentered';
import Header from '../../components/Header';
import Text from '../../components/Text';
import TitleCard from '../../components/TitleCard';
import { api } from '../../services/api';
import { useAPI } from '../../services/hooks';
import { selectSettings } from '../../services/redux/modules/settings/selector';
import { changeRegistrations } from '../../services/redux/modules/settings/thunk';
import {
  selectIsPublic,
  selectUser,
} from '../../services/redux/modules/user/selector';
import { useAppDispatch } from '../../services/redux/tools';
import { getSpotifyLogUrl } from '../../services/tools';
import DarkModeSwitch from './DarkModeSwitch';
import DeleteUser from './DeleteUser';
import Importer from './Importer';
import s from './index.module.css';
import PublicToken from './PublicToken';
import Rename from './Rename';
import SetAdmin from './SetAdmin';
import SettingLine from './SettingLine';

export default function Settings() {
  const dispatch = useAppDispatch();
  const settings = useSelector(selectSettings);
  const sme = useAPI(api.sme);
  const user = useSelector(selectUser);
  const isPublic = useSelector(selectIsPublic);

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
        <Text element="h3">Your settings are loading</Text>
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
        hideInterval
      />
      <div className={s.content}>
        <Grid container spacing={2}>
          {!isPublic && (
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
          )}
          {sme && !isPublic && (
            <Grid item xs={12} md={12} lg={6}>
              <TitleCard title="Linked Spotify account">
                <SettingLine left="Id" right={sme.id} />
                <SettingLine left="Mail" right={sme.email} />
                <SettingLine left="Product type" right={sme.product} />
              </TitleCard>
            </Grid>
          )}
          {user.admin && !isPublic && (
            <>
              <Grid item xs={12} md={12} lg={6}>
                <TitleCard
                  title="Set admin status"
                  right={
                    <Text className={s.onlyadmin}>
                      Only admins can see this
                    </Text>
                  }>
                  <SetAdmin />
                </TitleCard>
              </Grid>
              <Grid item xs={12} md={12} lg={6}>
                <TitleCard
                  title="Delete users"
                  right={
                    <Text className={s.onlyadmin}>
                      Only admins can see this
                    </Text>
                  }>
                  <DeleteUser />
                </TitleCard>
              </Grid>
            </>
          )}
          {!isPublic && (
            <Grid item xs={12} md={12} lg={6}>
              <TitleCard title="Miscellaneous">
                {user.admin && (
                  <SettingLine
                    left={
                      <Text>
                        Allow new registrations&nbsp;
                        <Text className={s.onlyadmin}>admin</Text>
                      </Text>
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
          )}
          {!isPublic && (
            <Grid item xs={12} md={12} lg={6}>
              <TitleCard title="Import data">
                <Importer />
              </TitleCard>
            </Grid>
          )}
          {!isPublic && (
            <Grid item xs={12} md={12} lg={6}>
              <TitleCard title="Rename account">
                <Rename />
              </TitleCard>
            </Grid>
          )}
          <Grid item xs={12} md={12} lg={6}>
            <TitleCard title="Dark mode">
              <SettingLine left="Dark mode type" right={<DarkModeSwitch />} />
            </TitleCard>
          </Grid>
          {!isPublic && (
            <Grid item xs={12} md={12} lg={6}>
              <TitleCard title="Public token">
                <PublicToken />
              </TitleCard>
            </Grid>
          )}
        </Grid>
      </div>
    </div>
  );
}
