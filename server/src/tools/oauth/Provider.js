const Axios = require('axios');
const { credentials } = require('./credentials');

class Provider {
  static getRedirect = () => {
  }

  // eslint-disable-next-line no-unused-vars
  static exchangeCode = code => {

  }

  // eslint-disable-next-line no-unused-vars
  static refresh = (refreshToken) => {
  }

  // eslint-disable-next-line no-unused-vars
  static getUniqueID = (accessToken) => {
  }

  // eslint-disable-next-line no-unused-vars
  static getHttpClient = accessToken => {
  }
}

class Spotify extends Provider {
  static getRedirect = () => {
    const { scopes } = credentials.spotify;
    const { redirectUri } = credentials.spotify;

    return `${'https://accounts.spotify.com/authorize'
      + '?response_type=code'
      + '&client_id='}${credentials.spotify.public
    }${scopes ? `&scope=${encodeURIComponent(scopes)}` : ''
    }&redirect_uri=${encodeURIComponent(redirectUri)}`;
  }

  static exchangeCode = async code => {
    const { data } = await Axios.post('https://accounts.spotify.com/api/token', null, {
      params: {
        grant_type: 'authorization_code',
        code,
        redirect_uri: credentials.spotify.redirectUri,
        client_id: credentials.spotify.public,
        client_secret: credentials.spotify.secret,
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: Date.now() + data.expires_in * 1000,
    };
  }

  static refresh = async refresh => {
    const { data } = await Axios.post('https://accounts.spotify.com/api/token', null, {
      params: {
        grant_type: 'refresh_token',
        refresh_token: refresh,
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${credentials.spotify.public}:${credentials.spotify.secret}`).toString('base64')}`,
      },
    });

    return {
      accessToken: data.access_token,
      expiresIn: Date.now() + data.expires_in * 1000,
    };
  }

  static getHttpClient = accessToken => Axios.create({
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Bearer ${accessToken}`,
    },
    baseURL: 'https://api.spotify.com/v1',
  })
}

module.exports = {
  Spotify,
};
