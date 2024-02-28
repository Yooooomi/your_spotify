import { createAction, createReducer } from "@reduxjs/toolkit";
import { addToPlaylist, fetchPlaylists } from "./thunk";
import { Playlist, PlaylistContext } from "./types";

interface PlaylistReducer {
  playlists: Playlist[] | null;
  context: PlaylistContext | null;
}

const initialState: PlaylistReducer = {
  playlists: null,
  context: null,
};

export const clearPlaylistContext = createAction("@playlist/clear");
export const setPlaylistContext =
  createAction<PlaylistContext>("@playlist/set");

export default createReducer(initialState, builder => {
  builder.addCase(fetchPlaylists.fulfilled, (state, { payload }) => {
    if (payload) {
      state.playlists = payload;
    }
  });

  builder.addCase(addToPlaylist.fulfilled, state => {
    state.context = null;
  });

  builder.addCase(clearPlaylistContext, state => {
    state.context = null;
  });

  builder.addCase(setPlaylistContext, (state, { payload }) => {
    state.context = payload;
  });
});
