import React from 'react';
import {
  Paper, Typography, Grid, Button,
} from '@material-ui/core';
import { connect } from 'react-redux';
import s from './index.module.css';
import { mapStateToProps, mapDispatchToProps } from '../../services/redux/tools';

const AccountFields = [
  { label: 'Account name', value: 'username' },
  { label: 'Linked', value: 'activated' },
];

const SpotifyFields = [
  { label: 'Account mail', value: 'email' },
  { label: 'Account name', value: 'display_name' },
  { label: 'Location', value: 'country' },
  { label: 'Product type', value: 'product' },
];

class Settings extends React.Component {
  render() {
    const { user } = this.props;

    return (
      <div className={s.root}>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Paper className={s.paper}>
              <div>
                <Typography variant="h5" align="left">Account infos</Typography>
                {
                  AccountFields.map(field => (
                    <div className={s.entry} key={field.value}>
                      <Typography align="left">{field.label}</Typography>
                      <Typography align="right">{user[field.value].toString()}</Typography>
                    </div>
                  ))
                }
              </div>
            </Paper>

          </Grid>
          <Grid item xs={6}>
            <Paper className={s.paper}>
              <div>
                <Typography variant="h5" align="left">Spotify infos</Typography>
                {
                  user.activated ? (
                    SpotifyFields.map(field => (
                      <div className={s.entry} key={field.value}>
                        <Typography align="left">{field.label}</Typography>
                        <Typography align="right">{user.spotify[field.value]}</Typography>
                      </div>
                    ))
                  ) : (
                      <div>
                        <a style={{ textDecoration: 'none' }} href={`${window.API_ENDPOINT}/oauth/spotify`}>
                          <Button fullWidth variant="contained" color="primary">
                            Login to Spotify
                          </Button>
                        </a>
                      </div>
                    )
                }
              </div>
            </Paper>
          </Grid>
          <Grid item xs={12}>
            <Paper className={s.footer}>
              <Grid container spacing={1}>
                <Grid item xs={4}>
                  <a style={{ textDecoration: 'none' }} href={`${window.API_ENDPOINT}/oauth/spotify`}>
                    <Button fullWidth variant="contained" color="primary">
                      Relog to Spotify
                    </Button>
                  </a>
                </Grid>
                <Grid item xs={4}>
                  <Button fullWidth variant="contained" color="primary">Disable this</Button>
                </Grid>
                <Grid item xs={4}>
                  <Button fullWidth variant="contained" color="primary">Disable this</Button>
                </Grid>
                <Grid item xs={4}>
                  <Button fullWidth variant="contained" color="primary">Disable this</Button>
                </Grid>
                <Grid item xs={4}>
                  <Button fullWidth variant="contained" color="primary">Disable this</Button>
                </Grid>
                <Grid item xs={4}>
                  <Button fullWidth variant="contained" color="primary">Disable this</Button>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Settings);
