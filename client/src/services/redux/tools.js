import API from '../API';

const mapStateToProps = state => ({
  user: state.userReducer.user,
  ready: state.readyReducer.ready,
  tracks: state.tracksReducer.tracks,
  full: state.tracksReducer.full,
  globalPreferences: state.globalPreferencesReducer.preferences,
});

const mapDispatchToProps = dispatch => ({
  updateGlobalPreferences: (pref) => {
    dispatch({ type: 'UPDATE_GLOBAL_PREFERENCES', pref });
  },
  updateReady: (ready) => {
    dispatch({ type: 'UPDATE_READY', ready });
  },
  updateUser: (user) => {
    dispatch({ type: 'UPDATE_USER', user });
  },
  refreshUser: async () => {
    try {
      const user = await API.me();
      dispatch({ type: 'UPDATE_USER_KEEP_SPOTIFY', user: user.data });
    } catch (e) {
      dispatch({ type: 'UPDATE_USER_KEEP_SPOTIFY', user: {} });
    }
  },
  addTracks: async (offset) => {
    const { data } = await API.getTracks(20, offset);
    dispatch({ type: 'ADD_TRACKS', tracks: data, full: data.length !== 20 });
  },
  manuallyAddTracks: (tracks) => {
    dispatch({ type: 'ADD_TRACKS', tracks });
  },
});

export { mapDispatchToProps, mapStateToProps };
