import { AsyncThunk, AsyncThunkPayloadCreator, createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '../..';
import { api } from '../../../api';
import { GlobalPreferences } from '../../../types';
import { alertMessage } from '../message/reducer';

const myAsyncThunk = <P, R>(
  name: string,
  payloadCreator: AsyncThunkPayloadCreator<R, P, { state: RootState }>,
): AsyncThunk<R, P, { state: RootState }> =>
  createAsyncThunk<R, P, { state: RootState }>(name, payloadCreator);

export const getSettings = myAsyncThunk<void, GlobalPreferences | null>(
  '@settings/get',
  async (_, tapi) => {
    try {
      const result = await api.globalPreferences();
      return result.data;
    } catch (e) {
      console.error(e);
      tapi.dispatch(
        alertMessage({
          level: 'error',
          message: `Could not retrieve global preferences`,
        }),
      );
    }
    return null;
  },
);

export const changeRegistrations = myAsyncThunk<boolean, GlobalPreferences | null>(
  '@settings/change-registrations',
  async (newStatus, tapi) => {
    try {
      const result = await api.setGlobalPreferences({
        allowRegistrations: newStatus,
      });
      tapi.dispatch(
        alertMessage({
          level: 'success',
          message: `Updated registration status to ${newStatus}`,
        }),
      );
      return result.data;
    } catch (e) {
      console.error(e);
      tapi.dispatch(
        alertMessage({
          level: 'error',
          message: `Could not update registration status to ${newStatus}`,
        }),
      );
    }
    return null;
  },
);
