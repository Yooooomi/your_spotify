import { createReducer } from '@reduxjs/toolkit';
import { GlobalPreferences } from '../../../types';
import { changeRegistrations, getSettings } from './thunk';

interface SettingsReducer {
  settings: GlobalPreferences | null;
}

const initialState: SettingsReducer = {
  settings: null,
};

export default createReducer(initialState, builder => {
  builder.addCase(getSettings.fulfilled, (state, { payload }) => {
    state.settings = payload;
  });
  builder.addCase(changeRegistrations.fulfilled, (state, { payload }) => {
    state.settings = payload;
  });
});
