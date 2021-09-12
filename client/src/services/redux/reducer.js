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
      console.error(error);
    },
    [addTracks.fulfilled]: (state, { payload: { data } }) => {
      // This means we requested already known tracks
      if (!data) {
        state.tracks = [...state.tracks];
        return;
      }
      state.tracks = [...state.tracks, ...data];
      state.tracksFull = data.length !== 20;
    },
    [addTracks.rejected]: (state, { error }) => {
      console.error(error);
    },
  },
});

export const {
  updateReady,
  updateUser,
  updateGlobalPreferences,
} = appSlice.actions;
