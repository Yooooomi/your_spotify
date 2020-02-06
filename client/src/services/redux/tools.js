import API from "../API";

const mapStateToProps = state => ({
  user: state.userReducer.user,
  ready: state.readyReducer.ready,
});

const mapDispatchToProps = dispatch => ({
  updateReady: (ready) => {
    dispatch({ type: 'UPDATE_READY', ready });
  },
  updateUser: (user) => {
    dispatch({ type: 'UPDATE_USER', user });
  },
  refreshUser: async () => {
    try {
      const user = await API.me();
      dispatch({ type: 'UPDATE_USER', user: user.data });
    } catch (e) {
      dispatch({ type: 'UPDATE_USER', user: {} });
    }
  },
});

export { mapDispatchToProps, mapStateToProps };