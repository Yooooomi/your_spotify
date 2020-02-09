import React from 'react';
import { Link, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { Button, TextField, Typography } from '@material-ui/core';
import s from '../index.module.css';
import API from '../../../services/API';
import urls from '../../../services/urls';
import { mapStateToProps, mapDispatchToProps } from '../../../services/redux/tools';

class Login extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      username: '',
      password: '',
    };
  }

    login = async ev => {
      ev.preventDefault();

      const { username, password } = this.state;
      const { history, updateUser, updateReady } = this.props;

      try {
        const { data } = await API.login(username, password);
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
        <form className={s.root} onSubmit={this.login}>
          <Typography variant="h5">Login</Typography>
          <div>
            <TextField margin="normal" fullWidth variant="outlined" label="Username" name="username" onChange={this.update} value={username} />
          </div>
          <div>
            <TextField margin="normal" fullWidth variant="outlined" label="Password" name="password" onChange={this.update} value={password} type="password" />
          </div>
          <div>
            <Button color="primary" variant="contained" fullWidth type="submit">Login</Button>
            <div className={s.underButton}>
              <Link className={s.link} to={urls.register}>Register</Link>
            </div>
          </div>
        </form>
      );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(Login));
