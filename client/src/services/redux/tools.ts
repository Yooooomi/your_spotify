import { AsyncThunkPayloadCreator, AsyncThunk, createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '.';

export const myAsyncThunk = <P, R>(
  name: string,
  payloadCreator: AsyncThunkPayloadCreator<R, P, { state: RootState }>,
): AsyncThunk<R, P, { state: RootState }> =>
  createAsyncThunk<R, P, { state: RootState }>(name, payloadCreator);
