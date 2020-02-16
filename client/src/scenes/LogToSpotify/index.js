import React from 'react';
import { Typography, Button } from '@material-ui/core';
import s from './index.module.css';

class LogToSpotify extends React.Component {
  render() {
    return (
      <div className={s.root}>
        <div className={s.entry}>
          <img src="/spotify.png" alt="spotify" />
        </div>
        <div className={s.entry}>
          <Typography variant="h1">
            Log in to Spotify
          </Typography>
          <div className={s.desc}>
            <Typography variant="caption">
              You need to give <em>Your Spotify</em> the permission to watch your activity in order to provide nice statistics about your account
            </Typography>
          </div>
        </div>
        <div className={s.entry}>
          <a style={{ textDecoration: 'none' }} href={`${window.API_ENDPOINT}/oauth/spotify`}>
            <Button fullWidth variant="contained" color="primary">
              Here
            </Button>
          </a>
        </div>
      </div>
    );
  }
}

export default LogToSpotify;
