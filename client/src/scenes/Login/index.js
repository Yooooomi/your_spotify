import React from 'react';
import s from './index.module.css';
import API from '../../services/API';
import urls from '../../services/urls';
import { Link, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { mapStateToProps, mapDispatchToProps } from '../../services/redux/tools';

class Login extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            username: '',
            password: '',
        };
    }

    login = async e => {
        e.preventDefault();

        const { username, password } = this.state;
        const { history, updateUser, updateReady } = this.props;

        try {
            const { data } = await API.login(username, password);
            API.setToken(data.token);
            updateUser(data.user);
            updateReady(true);
            history.push(urls.home);
        } catch (e) {
            console.error(e);
        }
    }

    update = e => this.setState({ [e.target.name]: e.target.value });

    render() {
        const { username, password } = this.props;

        return (
            <form className={s.root} onSubmit={this.login} >
                <div>
                    <input name="username" onChange={this.update} value={username} placeholder="username" />
                </div>
                <div>
                    <input name="password" onChange={this.update} value={password} placeholder="password" type="password" />
                </div>
                <div>
                    <button type="submit">Login</button>
                </div>
                <Link to={urls.register}>Register</Link>
            </form>
        )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(Login));