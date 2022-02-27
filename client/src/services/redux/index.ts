import { configureStore } from '@reduxjs/toolkit';

import userReducer from './modules/user/reducer';
import settingsReducer from './modules/settings/reducer';
import messageReducer from './modules/message/reducer';
import adminReducer from './modules/admin/reducer';

const store = configureStore({
  reducer: {
    user: userReducer,
    settings: settingsReducer,
    message: messageReducer,
    admin: adminReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;

export default store;
