import { AsyncThunk, AsyncThunkPayloadCreator, createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '../..';
import { api } from '../../../api';
import { alertMessage } from '../message/reducer';
import { AdminAccount } from './reducer';

const myAsyncThunk = <P, R>(
  name: string,
  payloadCreator: AsyncThunkPayloadCreator<R, P, { state: RootState }>,
): AsyncThunk<R, P, { state: RootState }> =>
  createAsyncThunk<R, P, { state: RootState }>(name, payloadCreator);

export const getAccounts = myAsyncThunk<void, AdminAccount[]>(
  '@admin/getAccounts',
  async (_, tapi) => {
    try {
      const result = await api.getAccounts();
      return result.data;
    } catch (e) {
      console.error(e);
      tapi.dispatch(
        alertMessage({
          level: 'error',
          message: `Could not retrieve all the registered accounts`,
        }),
      );
      throw e;
    }
  },
);

export const setAdmin = myAsyncThunk<{ id: string; status: boolean }, void>(
  '@admin/setAdmin',
  async ({ id, status }, tapi) => {
    try {
      await api.setAdmin(id, status);
    } catch (e) {
      console.error(e);
      tapi.dispatch(
        alertMessage({
          level: 'error',
          message: `Could not set this user admin status`,
        }),
      );
      throw e;
    }
  },
);

export const deleteUser = myAsyncThunk<{ id: string }, void>(
  '@admin/deleteUser',
  async ({ id }, tapi) => {
    try {
      await api.deleteUser(id);
    } catch (e) {
      console.error(e);
      tapi.dispatch(
        alertMessage({
          level: 'error',
          message: `Could not delete this user`,
        }),
      );
      throw e;
    }
  },
);
