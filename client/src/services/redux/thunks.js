import { createAsyncThunk } from '@reduxjs/toolkit';
import API from '../API';

export const refreshUser = createAsyncThunk('user/refresh', () => API.me());
export const addTracks = createAsyncThunk(
  'tracks/add',
  (offset = -1, thunkApi) => {
    const total = thunkApi.getState().app.tracks.length;
    if (offset === -1) {
      offset = total;
    } else if (offset < total) {
      return { data: null };
    }
    return API.getTracks(20, offset);
  },
);
