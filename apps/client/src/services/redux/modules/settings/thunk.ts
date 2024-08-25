import { api } from "../../../apis/api";
import { GlobalPreferences } from "../../../types";
import { myAsyncThunk } from "../../tools";
import { alertMessage } from "../message/reducer";
import { checkLogged } from "../user/thunk";
import { User } from "../user/types";

export const getVersion = myAsyncThunk<
  { update: boolean; version: string },
  void
>("@settings/version", async () => {
  try {
    const version = await api.version();
    return version.data;
  } catch (e) {
    console.error(e);
    throw e;
  }
});

export const getSettings = myAsyncThunk<GlobalPreferences | null, void>(
  "@settings/get",
  async (_, tapi) => {
    try {
      const result = await api.globalPreferences();
      return result.data;
    } catch (e) {
      console.error(e);
      tapi.dispatch(
        alertMessage({
          level: "error",
          message: "The web application can't communicate with the server",
        }),
      );
    }
    return null;
  },
);

export const changeRegistrations = myAsyncThunk<
  GlobalPreferences | null,
  boolean
>("@settings/change-registrations", async (newStatus, tapi) => {
  try {
    const result = await api.setGlobalPreferences({
      allowRegistrations: newStatus,
    });
    tapi.dispatch(
      alertMessage({
        level: "success",
        message: `Updated registration status to ${newStatus}`,
      }),
    );
    return result.data;
  } catch (e) {
    console.error(e);
    tapi.dispatch(
      alertMessage({
        level: "error",
        message: `Could not update registration status to ${newStatus}`,
      }),
    );
    throw e;
  }
});

export const changeTimezone = myAsyncThunk<void, User["settings"]["timezone"]>(
  "@settings/change-timezone",
  async (newTimezone, tapi) => {
    try {
      await api.setSetting("timezone", newTimezone);
      await tapi.dispatch(checkLogged());
      tapi.dispatch(
        alertMessage({
          level: "success",
          message: `Updated timezone status to ${
            newTimezone ?? "follow backend timezone"
          }`,
        }),
      );
    } catch (e) {
      console.error(e);
      tapi.dispatch(
        alertMessage({
          level: "error",
          message: `Could not update timezone to ${newTimezone}`,
        }),
      );
      throw e;
    }
  },
);

export const changeDateFormat = myAsyncThunk<
  void,
  User["settings"]["dateFormat"]
>("@settings/change-date-format", async (newDateFormat, tapi) => {
  try {
    await api.setSetting("dateFormat", newDateFormat);
    await tapi.dispatch(checkLogged());
    tapi.dispatch(
      alertMessage({
        level: "success",
        message: `Updated date format to ${newDateFormat}`,
      }),
    );
  } catch (e) {
    console.error(e);
    tapi.dispatch(
      alertMessage({
        level: "error",
        message: `Could not update date format to ${newDateFormat}`,
      }),
    );
    throw e;
  }
});

export const changeStatUnit = myAsyncThunk<
  void,
  User["settings"]["metricUsed"]
>("@settings/change-stat-measurement", async (newStatMeasurement, tapi) => {
  try {
    await api.setSetting("metricUsed", newStatMeasurement);
    await tapi.dispatch(checkLogged());
    tapi.dispatch(
      alertMessage({
        level: "success",
        message: `Updated stat measurement to ${newStatMeasurement}`,
      }),
    );
  } catch (e) {
    console.error(e);
    tapi.dispatch(
      alertMessage({
        level: "error",
        message: `Could not update stat measurement to ${newStatMeasurement}`,
      }),
    );
    throw e;
  }
});
