import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../..';

const selectSettingsState = (state: RootState) => state.settings;

export const selectSettings = createSelector(
  selectSettingsState,
  state => state.settings,
);
