import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../..';

const selectMessageState = (state: RootState) => state.message;

export const selectMessage = createSelector(
  selectMessageState,
  state => state.message,
);
