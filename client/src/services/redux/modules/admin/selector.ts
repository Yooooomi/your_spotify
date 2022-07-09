import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../..';

const selectAdminState = (state: RootState) => state.admin;

export const selectAccounts = createSelector(
  selectAdminState,
  state => state.accounts,
);
