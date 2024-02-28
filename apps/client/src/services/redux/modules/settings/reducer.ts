import { createReducer } from "@reduxjs/toolkit";
import { GlobalPreferences } from "../../../types";
import { changeRegistrations, getSettings, getVersion } from "./thunk";

interface SettingsReducer {
  settings: GlobalPreferences | null;
  version: string | null;
  update: boolean;
}

const initialState: SettingsReducer = {
  settings: null,
  version: null,
  update: false,
};

export default createReducer(initialState, builder => {
  builder.addCase(getSettings.fulfilled, (state, { payload }) => {
    state.settings = payload;
  });
  builder.addCase(changeRegistrations.fulfilled, (state, { payload }) => {
    state.settings = payload;
  });
  builder.addCase(getVersion.fulfilled, (state, { payload }) => {
    state.version = payload.version;
    state.update = payload.update;
  });
});
