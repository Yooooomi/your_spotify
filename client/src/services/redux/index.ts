import { configureStore } from "@reduxjs/toolkit";

import userReducer from "./modules/user/reducer";
import settingsReducer from "./modules/settings/reducer";
import messageReducer from "./modules/message/reducer";

const store = configureStore({
  reducer: {
    user: userReducer,
    settings: settingsReducer,
    message: messageReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;

export default store;
