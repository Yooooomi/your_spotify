import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../..';

const selectImportState = (state: RootState) => state.import;

export const selectImportStates = createSelector(
  selectImportState,
  state => state.imports,
);
