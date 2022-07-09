import { api } from '../../../api';
import { GlobalPreferences } from '../../../types';
import { myAsyncThunk } from '../../tools';
import { alertMessage } from '../message/reducer';

export const getSettings = myAsyncThunk<GlobalPreferences | null, void>(
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
          message: 'Could not retrieve global preferences',
        }),
      );
    }
    return null;
  },
);

export const changeRegistrations = myAsyncThunk<
  GlobalPreferences | null,
  boolean
>('@settings/change-registrations', async (newStatus, tapi) => {
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
    throw e;
  }
});
