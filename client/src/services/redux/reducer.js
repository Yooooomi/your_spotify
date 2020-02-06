/* eslint-disable no-case-declarations */
import { createStore, combineReducers } from 'redux';

const initialUser = {};

const userReducer = (state = initialUser, action) => {
  switch (action.type) {
    case 'UPDATE_USER':
      return { ...state, user: action.user };
    default:
      return state;
  }
}

const initialReady = false;

const readyReducer = (state = initialReady, action) => {
  switch (action.type) {
    case 'UPDATE_READY':
      return { ...state, ready: action.ready };
    default:
      return state;
  }
};

const rootReducer = combineReducers({
  userReducer,
  readyReducer,
});

const store = createStore(rootReducer);

export default store;
