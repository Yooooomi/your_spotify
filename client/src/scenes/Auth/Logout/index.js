import React from 'react';
import { Redirect } from 'react-router-dom';
import urls from '../../../services/urls';
import API from '../../../services/API';

class Logout extends React.Component {
  // eslint-disable-next-line class-methods-use-this
  componentDidMount() {
    API.logout();
  }

  // eslint-disable-next-line class-methods-use-this
  render() {
    return (
      <Redirect to={urls.login} />
    );
  }
}

export default Logout;
