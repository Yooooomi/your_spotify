import { createAction, createReducer } from "@reduxjs/toolkit";
import { checkLogged, login } from "./thunk";
import { User } from "./types";

interface UserReducer {
  loaded: boolean;
  user: User | null;
}

const initialState: UserReducer = {
  loaded: false,
  user: null,
};

export const logout = createAction("@user/logout");

export default createReducer(initialState, (builder) => {
  builder.addCase(logout, (state) => {
    state.user = null;
  });
  builder.addCase(login.fulfilled, (state, { payload }) => {
    state.user = payload;
    state.loaded = true;
  });
  builder.addCase(checkLogged.fulfilled, (state, { payload }) => {
    state.user = payload;
    state.loaded = true;
  });
});
