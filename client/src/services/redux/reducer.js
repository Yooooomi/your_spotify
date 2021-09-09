import { createSlice } from '@reduxjs/toolkit';
import { addTracks, refreshUser } from './thunks';

const initialState = {
  user: null,
  ready: false,

  tracks: [],
  tracksFull: false,

  globalPreferences: null,
};

export const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    updateReady: (state, { payload }) => {
      state.ready = payload;
    },
    updateUser: (state, { payload }) => {
      state.user = payload;
    },
    updateGlobalPreferences: (state, { payload }) => {
      state.globalPreferences = payload;
    },
  },
  extraReducers: {
    [refreshUser.fulfilled]: (state, { payload: { data } }) => {
      state.user = data;
    },
    [refreshUser.rejected]: (state, { error }) => {
      console.log('refresh user crashed', error);
    },
    [addTracks.fulfilled]: (state, { payload: { data } }) => {
      state.tracks.push(...data);
      state.tracksFull = data.length !== 20;
    },
    [addTracks.rejected]: (state, { error }) => {
      console.log('addtracks crashed', error);
    },
  },
});

export const {
  updateReady,
  updateUser,
  updateGlobalPreferences,
} = appSlice.actions;
