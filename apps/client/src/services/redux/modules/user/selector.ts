import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "../..";
import { getRawIntervalDetail, RawIntervalDetail } from "../../../intervals";
import { fromReduxIntervalDetail } from "./utils";

const selectUserState = (state: RootState) => state.user;

export const selectLoaded = createSelector(
  selectUserState,
  state => state.loaded,
);
export const selectUser = createSelector(selectUserState, state => state.user);
export const selectInterval = createSelector(
  selectUserState,
  state => fromReduxIntervalDetail(state.intervalDetail).interval,
);

export const selectIntervalDetail = createSelector(selectUserState, state =>
  fromReduxIntervalDetail(state.intervalDetail),
);

export const selectRawIntervalDetail = createSelector(
  selectUserState,
  (state): RawIntervalDetail =>
    getRawIntervalDetail(
      fromReduxIntervalDetail(state.intervalDetail),
      state.user ?? undefined,
    ),
);

export const selectRawAllInterval = createSelector(
  selectUserState,
  (state): RawIntervalDetail =>
    getRawIntervalDetail(
      fromReduxIntervalDetail({ type: "userbased", index: 0 }),
      state.user ?? undefined,
    ),
);

export const selectPublicToken = createSelector(
  selectUserState,
  state => state.publicToken,
);
export const selectIsPublic = createSelector(selectPublicToken, token =>
  Boolean(token),
);
export const selectDarkMode = createSelector(
  selectUser,
  user => user?.settings.darkMode ?? "follow",
);
export const selectTimezone = createSelector(
  selectUser,
  user => user?.settings.timezone ?? "follow",
);
export const selectDateFormat = createSelector(
  selectUser,
  user => user?.settings.dateFormat ?? "default",
);
export const selectStatMeasurement = createSelector(
  selectUser,
  user => user?.settings.metricUsed ?? "number",
);
export const selectBlacklistedArtist = (artistId: string) =>
  createSelector(selectUser, user =>
    Boolean(user?.settings.blacklistedArtists?.find(art => art === artistId)),
  );
export const selectBlacklistedArtists = createSelector(
  selectUser,
  user => user?.settings.blacklistedArtists ?? [],
);
