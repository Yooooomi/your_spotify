import { api } from '../../../api';
import { myAsyncThunk } from '../../tools';
import { alertMessage } from '../message/reducer';
import { AdminAccount } from './reducer';

export const getAccounts = myAsyncThunk<AdminAccount[], void>(
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
          message: 'Could not retrieve all the registered accounts',
        }),
      );
      throw e;
    }
  },
);

export const setAdmin = myAsyncThunk<void, { id: string; status: boolean }>(
  '@admin/setAdmin',
  async ({ id, status }, tapi) => {
    try {
      await api.setAdmin(id, status);
    } catch (e) {
      console.error(e);
      tapi.dispatch(
        alertMessage({
          level: 'error',
          message: 'Could not set this user admin status',
        }),
      );
      throw e;
    }
  },
);

export const deleteUser = myAsyncThunk<void, { id: string }>(
  '@admin/deleteUser',
  async ({ id }, tapi) => {
    try {
      await api.deleteUser(id);
    } catch (e) {
      console.error(e);
      tapi.dispatch(
        alertMessage({
          level: 'error',
          message: 'Could not delete this user',
        }),
      );
      throw e;
    }
  },
);
