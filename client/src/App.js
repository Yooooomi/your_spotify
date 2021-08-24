import React from 'react';
import { MuiThemeProvider } from '@material-ui/core';
import { connect } from 'react-redux';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import './App.css';
import Login from './scenes/Auth/Login';
import urls from './services/urls';
import { mapStateToProps, mapDispatchToProps } from './services/redux/tools';
import API from './services/API';
import Register from './scenes/Auth/Register';
import PrivateRoute from './components/PrivateRoute';
import Home from './scenes/Home';
import History from './scenes/HistoryScene';
import Layout from './components/Layout';
import theme from './services/theme';
import Settings from './scenes/Settings';
import Logout from './scenes/Auth/Logout';
import LogToSpotify from './scenes/LogToSpotify';
import AllStats from './scenes/AllStats';
import SnackbarMessage from './components/SnackbarMessage';
import Artist from './scenes/Artist';
import TopSongs from './scenes/Tops/TopSongs';
import TopArtists from './scenes/Tops/TopArtists';
import TopAlbums from './scenes/Tops/TopAlbums';

class App extends React.Component {
  async componentDidMount() {
    const { updateUser, updateReady, updateGlobalPreferences } = this.props;

    try {
      const { data: globalPreferences } = await API.globalPreferences();
      updateGlobalPreferences(globalPreferences);
    } catch (e) {
      window.message('error', 'Could not retrieve the global preferences of the application');
    }

    try {
      const { data } = await API.me();

      data.spotify = null;

      if (data.activated) {
        try {
          const spot = await API.sme();
          data.spotify = spot.data;
        } catch (e) {
          window.message(
            'error',
            'Something went wrong with your Spotify profile, try relogging to Spotify through the Setttings',
          );
        }
      }
      updateUser(data);
    } catch (e) {
      // User is just not logged
    } finally {
      updateReady(true);
    }
  }

  render = () => (
    <div className="App">
      <Router>
        <MuiThemeProvider theme={theme}>
          <SnackbarMessage />
          <Layout>
            <Switch>
              <PrivateRoute spotify exact path={urls.artist} component={Artist} />
              <PrivateRoute spotify exact path={urls.home} component={Home} />
              <PrivateRoute spotify exact path={urls.history} component={History} />
              <PrivateRoute exact path={urls.allStats} component={AllStats} />
              <PrivateRoute exact path={urls.settings} component={Settings} />
              <PrivateRoute exact path={urls.activateSpotify} component={LogToSpotify} />
              <PrivateRoute exact path={urls.topSongs} component={TopSongs} />
              <PrivateRoute exact path={urls.topAlbums} component={TopAlbums} />
              <PrivateRoute exact path={urls.topArtists} component={TopArtists} />
              <PrivateRoute exact path={urls.logout} component={Logout} />
              <Route exact path={urls.register} component={Register} />
              <Route exact path={urls.login} component={Login} />
            </Switch>
          </Layout>
        </MuiThemeProvider>
      </Router>
    </div>
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
