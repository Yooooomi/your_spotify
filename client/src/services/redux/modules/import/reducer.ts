import { createReducer } from '@reduxjs/toolkit';
import { getImports } from './thunk';
import { ImporterState } from './types';

interface ImportReducer {
  imports: ImporterState[] | null;
}

const initialState: ImportReducer = {
  imports: null,
};

export default createReducer(initialState, builder => {
  builder.addCase(getImports.fulfilled, (state, { payload }) => {
    if (payload) {
      state.imports = payload;
    }
  });
});
