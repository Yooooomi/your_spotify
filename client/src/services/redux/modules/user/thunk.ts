import { api } from '../../../api';
import { myAsyncThunk } from '../../tools';
import { alertMessage } from '../message/reducer';
import { selectIsPublic } from './selector';
import { DarkModeType, User } from './types';

export const checkLogged = myAsyncThunk<User | null, void>('@user/checklogged', async () => {
  try {
    const { data } = await api.me();
    return data.status ? data.user : null;
  } catch (e) {
    console.error(e);
  }
  return null;
});

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
          message: `Could not generate a new public token`,
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
          message: `Could not sync the dark mode to your profile`,
        }),
      );
      throw e;
    }
  },
);
