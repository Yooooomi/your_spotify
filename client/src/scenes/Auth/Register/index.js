import React from 'react';
import s from '../index.module.css';
import API from '../../../services/API';
import { withRouter, Link } from 'react-router-dom';
import urls from '../../../services/urls';
import { TextField, Button, Typography } from '@material-ui/core';

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
                <Typography variant="h5">Register</Typography>
                <div>
                    <TextField fullWidth margin="normal" variant="outlined" label="Username" name="username" onChange={this.update} value={username} />
                </div>
                <div>
                    <TextField fullWidth margin="normal" variant="outlined" label="Password" name="password" onChange={this.update} value={password} type="password" />
                </div>
                <div>
                    <Button fullWidth variant="contained" color="primary" type="submit">register</Button>
                    <div className={s.underButton}>
                        <Link className={s.link} to={urls.login}>Login</Link>
                    </div>
                </div>
            </form>
        )
    }
}

export default withRouter(Register);