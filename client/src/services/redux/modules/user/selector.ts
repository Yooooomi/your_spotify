import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../..';
import { fromReduxIntervalDetail } from '../../../date';

const selectUserState = (state: RootState) => state.user;

export const selectLoaded = createSelector(selectUserState, (state) => state.loaded);
export const selectUser = createSelector(selectUserState, (state) => state.user);
export const selectInterval = createSelector(
  selectUserState,
  (state) => fromReduxIntervalDetail(state.intervalDetail).interval,
);
export const selectIntervalDetail = createSelector(selectUserState, (state) =>
  fromReduxIntervalDetail(state.intervalDetail),
);
