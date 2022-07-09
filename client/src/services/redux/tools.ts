import {
  AsyncThunkPayloadCreator,
  AsyncThunk,
  createAsyncThunk,
} from '@reduxjs/toolkit';
import { useDispatch } from 'react-redux';
import store, { RootState } from '.';

export type AsyncThunkConfig = {
  /** return type for `thunkApi.getState` */
  state: ReturnType<typeof store.getState>;
  /** type for `thunkApi.dispatch` */
  dispatch: typeof store.dispatch;
  /** type of the `extra` argument for the thunk middleware, which will be passed in as `thunkApi.extra` */
  extra?: never;
  /** type to be passed into `rejectWithValue`'s first argument that will end up on `rejectedAction.payload` */
  rejectValue?: unknown;
  /** return type of the `serializeError` option callback */
  serializedErrorType?: unknown;
  /** type to be returned from the `getPendingMeta` option callback & merged into `pendingAction.meta` */
  pendingMeta?: unknown;
  /** type to be passed into the second argument of `fulfillWithValue` to finally be merged into `fulfilledAction.meta` */
  fulfilledMeta?: unknown;
  /** type to be passed into the second argument of `rejectWithValue` to finally be merged into `rejectedAction.meta` */
  rejectedMeta?: unknown;
};

export const useAppDispatch = () => useDispatch<typeof store.dispatch>();

export const myAsyncThunk = <R, P>(
  name: string,
  payloadCreator: AsyncThunkPayloadCreator<R, P, AsyncThunkConfig>,
): AsyncThunk<R, P, { state: RootState }> =>
  createAsyncThunk<R, P, AsyncThunkConfig>(name, payloadCreator);
