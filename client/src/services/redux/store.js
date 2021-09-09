import { combineReducers, createStore, applyMiddleware } from '@reduxjs/toolkit';
import thunk from 'redux-thunk';
import { appSlice } from './reducer';

const rootReducer = combineReducers({
  app: appSlice.reducer,
});

export const store = createStore(rootReducer, applyMiddleware(thunk));
