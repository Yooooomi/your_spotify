const Axios = require('axios');

const axios = Axios.create({
  baseURL: window.API_ENDPOINT,
  withCredentials: true,
});

const API = {
  spotify: () => axios.get('/oauth/spotify'),
  login: (username, password) => axios.post('/login', {
    username, password,
  }),
  register: (username, password) => axios.post('/register', {
    username, password,
  }),
  logout: () => axios.post('/logout'),
  me: () => axios.get('/me'),
  sme: () => axios.get('/oauth/spotify/me'),
  play: id => axios.post('/spotify/play', {
    id,
  }),
  getTracks: (number, offset) => axios.get('/spotify/gethistory', {
    params: { number, offset },
  }),
  mostListened: (start, end) => axios.get('/spotify/most_listened', {
    params: { start, end },
  }),
  mostListenedArtist: (start, end, timeSplit) => axios.get('/spotify/most_listened_artist', {
    params: { start, end, timeSplit },
  }),
  listened_to: (start, end) => axios.get('/spotify/listened_to', {
    params: { start, end },
  }),
  songsPer: (start, end, timeSplit) => axios.get('/spotify/songs_per', {
    params: { start, end, timeSplit },
  }),
  timePer: (start, end, timeSplit) => axios.get('/spotify/time_per', {
    params: { start, end, timeSplit },
  }),
  featRatio: (start, end, timeSplit) => axios.get('/spotify/feat_ratio', {
    params: { start, end, timeSplit },
  }),
  albumDateRatio: (start, end, timeSplit) => axios.get('/spotify/album_date_ratio', {
    params: { start, end, timeSplit },
  }),
  popularityPer: (start, end, timeSplit) => axios.get('/spotify/popularity_per', {
    params: { start, end, timeSplit },
  }),
  differentArtistsPer: (start, end, timeSplit) => axios.get('/spotify/different_artists_per', {
    params: { start, end, timeSplit },
  }),
  setSetting: (settingName, settingValue) => axios.post('/settings', {
    [settingName]: settingValue,
  }),
};

export default {
  ...API,
};
