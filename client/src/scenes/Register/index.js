import React from 'react';
import s from './index.module.css';
import API from '../../services/API';
import { withRouter, Link } from 'react-router-dom';
import urls from '../../services/urls';

class Register extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            username: '',
            password: '',
        };
    }

    register = async e => {
        e.preventDefault();

        const { username, password } = this.state;
        const { history } = this.props;

        try {
            await API.register(username, password);
            history.push(urls.login);
        } catch (e) {
            console.error(e);
        }
    }

    update = e => this.setState({ [e.target.name]: e.target.value });

    render() {
        const { username, password } = this.props;

        return (
            <form className={s.root} onSubmit={this.register} >
                <div>
                    <input name="username" onChange={this.update} value={username} placeholder="username" />
                </div>
                <div>
                    <input name="password" onChange={this.update} value={password} placeholder="password" type="password" />
                </div>
                <div>
                    <button type="submit">register</button>
                </div>
                <Link to={urls.login}>Login</Link>
            </form>
        )
    }
}

export default withRouter(Register);