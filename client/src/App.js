import React from 'react';
import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Login from './scenes/Login';
import urls from './services/urls';
import { connect } from 'react-redux';
import { mapStateToProps, mapDispatchToProps } from './services/redux/tools';
import API from './services/API';
import Register from './scenes/Register';
import PrivateRoute from './components/PrivateRoute';
import Home from './scenes/Home';

class App extends React.Component {
  async componentDidMount() {
    const { updateUser, updateReady } = this.props;

    try {
      API.init();
      const { data } = await API.me();
      updateUser(data);
    } catch (e) {
      console.log('Not logged');
    } finally {
      updateReady(true);
    }
  }

  render() {
    return (
      <div className="App">
        <Router>
          <Switch>
            <PrivateRoute exact path={urls.home} component={Home} />
            <Route exact path={urls.register} component={Register} />
            <Route exact path={urls.login} component={Login} />
          </Switch>
        </Router>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
