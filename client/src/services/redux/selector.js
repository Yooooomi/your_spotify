import { createSelector } from '@reduxjs/toolkit';

const selectAppState = (state) => state.app;

export const selectUser = createSelector([selectAppState], (app) => app.user);
export const selectReady = createSelector([selectAppState], (app) => app.ready);
export const selectTracks = createSelector([selectAppState], (app) => ({ tracks: app.tracks, full: app.tracksFull }));
export const selectGlobalPreferences = createSelector([selectAppState], (app) => app.globalPreferences);
