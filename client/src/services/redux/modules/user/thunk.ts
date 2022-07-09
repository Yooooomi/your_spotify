import { api } from '../../../api';
import { myAsyncThunk } from '../../tools';
import { alertMessage } from '../message/reducer';
import { selectIsPublic } from './selector';
import { DarkModeType, User } from './types';

export const checkLogged = myAsyncThunk<User | null, void>(
  '@user/checklogged',
  async () => {
    try {
      const { data } = await api.me();
      return data.status ? data.user : null;
    } catch (e) {
      console.error(e);
    }
    return null;
  },
);

export const changeUsername = myAsyncThunk<void, string>(
  '@user/change-username',
  async (newName, tapi) => {
    try {
      await api.rename(newName);
      tapi.dispatch(
        alertMessage({
          level: 'success',
          message: `Successfully renamed to ${newName}`,
        }),
      );
    } catch (e) {
      console.error(e);
      tapi.dispatch(
        alertMessage({
          level: 'error',
          message: `Could not rename to ${newName}`,
        }),
      );
      throw e;
    }
  },
);

export const generateNewPublicToken = myAsyncThunk<string, void>(
  '@user/generate-public-token',
  async (_, tapi) => {
    try {
      const { data: token } = await api.generatePublicToken();
      return token;
    } catch (e) {
      console.error(e);
      tapi.dispatch(
        alertMessage({
          level: 'error',
          message: 'Could not generate a new public token',
        }),
      );
      throw e;
    }
  },
);

export const setDarkMode = myAsyncThunk<void, DarkModeType>(
  '@user/set-dark-mode',
  async (payload, tapi) => {
    const isPublic = selectIsPublic(tapi.getState());

    try {
      if (!isPublic) {
        await api.setSetting('darkMode', payload);
      }
    } catch (e) {
      console.error(e);
      tapi.dispatch(
        alertMessage({
          level: 'error',
          message: 'Could not sync the dark mode to your profile',
        }),
      );
      throw e;
    }
  },
);

export const playTrack = myAsyncThunk<void, string>(
  '@user/play-track',
  async (payload, tapi) => {
    try {
      await api.play(payload);
    } catch (e: any) {
      const reason = e?.response?.data?.reason;
      if (reason === 'NO_ACTIVE_DEVICE') {
        tapi.dispatch(
          alertMessage({
            level: 'info',
            message: 'Could not play the song, no active player detected',
          }),
        );
      } else if (reason === 'PREMIUM_REQUIRED') {
        tapi.dispatch(
          alertMessage({
            level: 'error',
            message:
              'You cannot play song from the platform without a premium account',
          }),
        );
      } else {
        console.error(e);
        tapi.dispatch(
          alertMessage({
            level: 'error',
            message: 'Could not play song',
          }),
        );
      }
    }
  },
);
