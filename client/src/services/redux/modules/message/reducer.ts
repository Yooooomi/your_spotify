import { createAction, createReducer } from '@reduxjs/toolkit';

export interface AlertMessage {
  level: 'info' | 'success' | 'error';
  message: string;
}

interface MessageReducer {
  message: AlertMessage | null;
}

const initialState: MessageReducer = {
  message: null,
};

export const alertMessage = createAction<AlertMessage>('@message/create');

export default createReducer(initialState, builder => {
  builder.addCase(alertMessage, (state, { payload }) => {
    state.message = payload;
  });
});
