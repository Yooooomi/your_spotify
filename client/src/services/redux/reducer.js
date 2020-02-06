/* eslint-disable no-case-declarations */
import { createStore, combineReducers } from 'redux';

const initialUser = {};

const userReducer = (state = initialUser, action) => {
  switch (action.type) {
    case 'UPDATE_USER':
      action.user.tracks = action.user.tracks || [];
      return { ...state, user: action.user };
    case 'ADD_TRACKS':
      return {
        ...state, user: {
          ...state.user,
          tracks: [...state.user.tracks, ...action.tracks],
          full: action.full,
        },
      }
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
