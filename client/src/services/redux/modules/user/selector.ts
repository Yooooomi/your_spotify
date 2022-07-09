import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../..';
import { getRawIntervalDetail, RawIntervalDetail } from '../../../intervals';
import { fromReduxIntervalDetail } from './utils';

const selectUserState = (state: RootState) => state.user;

export const selectLoaded = createSelector(
  selectUserState,
  state => state.loaded,
);
export const selectUser = createSelector(selectUserState, state => state.user);
export const selectInterval = createSelector(
  selectUserState,
  state => fromReduxIntervalDetail(state.intervalDetail).interval,
);

export const selectIntervalDetail = createSelector(selectUserState, state =>
  fromReduxIntervalDetail(state.intervalDetail),
);

export const selectRawIntervalDetail = createSelector(
  selectUserState,
  (state): RawIntervalDetail =>
    getRawIntervalDetail(
      fromReduxIntervalDetail(state.intervalDetail),
      state.user,
    ),
);

export const selectPublicToken = createSelector(
  selectUserState,
  state => state.publicToken,
);
export const selectIsPublic = createSelector(selectPublicToken, token =>
  Boolean(token),
);
export const selectDarkMode = createSelector(
  selectUser,
  user => user?.settings.darkMode ?? 'follow',
);
