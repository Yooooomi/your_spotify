import { AsyncThunk, AsyncThunkPayloadCreator, createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '../..';
import { api } from '../../../api';
import { alertMessage } from '../message/reducer';
import { User } from './types';

const myAsyncThunk = <P, R>(
  name: string,
  payloadCreator: AsyncThunkPayloadCreator<R, P, { state: RootState }>,
): AsyncThunk<R, P, { state: RootState }> =>
  createAsyncThunk<R, P, { state: RootState }>(name, payloadCreator);

export const checkLogged = myAsyncThunk<void, User | null>('@user/checklogged', async () => {
  try {
    const { data } = await api.me();
    return data.status ? data.user : null;
  } catch (e) {
    console.error(e);
  }
  return null;
});

export const changeUsername = myAsyncThunk<string, void>(
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
