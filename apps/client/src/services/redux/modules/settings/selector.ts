import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "../..";

const selectSettingsState = (state: RootState) => state.settings;

export const selectSettings = createSelector(
  selectSettingsState,
  state => state.settings,
);

export const selectVersion = createSelector(
  selectSettingsState,
  state => state.version,
);

export const selectUpdateAvailable = createSelector(
  selectSettingsState,
  state => state.update,
);

export const selectAffinityEnabled = createSelector(
  selectSettingsState,
  state => state.settings?.allowAffinity ?? false,
);
