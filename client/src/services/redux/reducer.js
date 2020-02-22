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
};

const initialTracks = {
  full: false,
  tracks: [],
};

const tracksReducer = (state = initialTracks, action) => {
  switch (action.type) {
  case 'ADD_TRACKS':
    return {
      ...state,
      tracks: [...state.tracks, ...action.tracks],
      full: action.full,
    };
  default:
    return state;
  }
};

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
  tracksReducer,
});

const store = createStore(rootReducer);

export default store;
