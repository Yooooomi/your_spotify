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

export const login = myAsyncThunk<{ username: string; password: string }, User | null>(
  '@user/login',
  async ({ username, password }, tapi) => {
    try {
      const { data } = await api.login(username, password);
      return data.user;
    } catch (e) {
      console.error(e);
      tapi.dispatch(
        alertMessage({
          level: 'error',
          message: 'Could not login, username or password incorrect',
        }),
      );
    }
    return null;
  },
);

export const register = myAsyncThunk<{ username: string; password: string }, void>(
  '@user/register',
  async ({ username, password }, tapi) => {
    try {
      await api.register(username, password);
      tapi.dispatch(
        alertMessage({
          level: 'success',
          message: 'Successfully registered',
        }),
      );
    } catch (e) {
      console.error(e);
      if ((e as any)?.response?.data?.code === 'REGISTRATIONS_NOT_ALLOWED') {
        tapi.dispatch(
          alertMessage({
            level: 'error',
            message: 'Registrations are disabled',
          }),
        );
      }
    }
  },
);

export const checkLogged = myAsyncThunk<void, User | null>('@user/checklogged', async () => {
  try {
    const { data } = await api.me();
    return data.status ? data.user : null;
  } catch (e) {
    console.error(e);
  }
  return null;
});

export const changePasswordForAccountId = myAsyncThunk<{ id: string; password: string }, void>(
  '@user/change-password-account-id',
  async ({ id, password }, tapi) => {
    try {
      await api.changePasswordAccountId(id, password);
      tapi.dispatch(
        alertMessage({
          level: 'success',
          message: 'Successfully changed the password for this account ID',
        }),
      );
    } catch (e) {
      console.error(e);
      tapi.dispatch(
        alertMessage({
          level: 'error',
          message: 'Could not change the password for this account ID',
        }),
      );
    }
  },
);
