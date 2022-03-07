import { createAction, createReducer } from '@reduxjs/toolkit';
import { intervals } from '../../../../components/IntervalSelector/IntervalSelector';
import { intervalDetailToRedux } from '../../../date';
import { Timesplit } from '../../../types';
import { changeUsername, checkLogged } from './thunk';
import { User } from './types';

export interface ReduxIntervalDetail {
  name: string;
  unit: string;
  interval: {
    start: number;
    end: number;
    timesplit: Timesplit;
  };
  index?: number;
}

interface UserReducer {
  loaded: boolean;
  user: User | null;
  intervalDetail: ReduxIntervalDetail;
}

const initialState: UserReducer = {
  loaded: false,
  user: null,
  intervalDetail: intervalDetailToRedux(intervals[0]),
};

export const logout = createAction('@user/logout');
export const setDataInterval = createAction<ReduxIntervalDetail>('@user/set-interval');

export default createReducer(initialState, (builder) => {
  builder.addCase(logout, (state) => {
    state.user = null;
  });
  builder.addCase(checkLogged.fulfilled, (state, { payload }) => {
    state.user = payload;
    state.loaded = true;
  });
  builder.addCase(changeUsername.fulfilled, (state, { meta: { arg } }) => {
    if (state.user) {
      state.user.username = arg;
    }
  });
  builder.addCase(setDataInterval, (state, { payload }) => {
    state.intervalDetail = payload;
  });
});
