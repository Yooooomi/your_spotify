import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "../..";

const selectPlaylistState = (state: RootState) => state.playlist;

export const selectPlaylistContext = createSelector(
  selectPlaylistState,
  state => state.context,
);

export const selectPlaylists = createSelector(
  selectPlaylistState,
  state => state.playlists,
);
