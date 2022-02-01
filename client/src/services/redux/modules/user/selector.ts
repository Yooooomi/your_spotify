import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../..';

const selectUserState = (state: RootState) => state.user;

export const selectLoaded = createSelector(selectUserState, (state) => state.loaded);
export const selectUser = createSelector(selectUserState, (state) => state.user);
