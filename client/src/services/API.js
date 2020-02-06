const Axios = require('axios');

const axios = Axios.create({
  baseURL: 'http://localhost:8080/',
  withCredentials: true,
});

let token = '';

const setToken = tk => {
  token = tk;
  localStorage.setItem('token', tk);
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

const init = () => {
  setToken(localStorage.getItem('token'));
}

const API = {
  login: (username, password) => axios.post('/login', {
    username, password,
  }),
  register: (username, password) => axios.post('/register', {
    username, password,
  }),
  me: () => axios.get('/me'),
  sme: () => axios.get('/oauth/spotify/me'),
  getTracks: (number, offset) => axios.get('/spotify/gethistory', {
    params: { number, offset },
  }),
  mostListened: (start, end) => axios.get('/spotify/most_listened', {
    params: { start, end },
  }),
  mostListenedArtist: (start, end) => axios.get('/spotify/most_listened_artist', {
    params: { start, end },
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
};

export default {
  init,
  setToken,
  ...API,
};
