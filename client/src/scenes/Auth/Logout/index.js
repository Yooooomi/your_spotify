import React from 'react';
import { Redirect } from 'react-router-dom';
import urls from '../../../services/urls';
import API from '../../../services/API';

class Logout extends React.Component {
    componentDidMount() {
        API.logout();
    }

    render() {
        return (
            <Redirect to={urls.login} />
        )
    }
}

export default Logout;