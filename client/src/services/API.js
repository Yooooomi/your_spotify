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
  changePassword: (oldPassword, newPassword) => axios.post('/changepassword', {
    oldPassword,
    newPassword,
  }),
  logout: () => axios.post('/logout'),
  me: () => axios.get('/me'),
  sme: () => axios.get('/oauth/spotify/me'),
  globalPreferences: () => axios.get('/global/preferences'),
  setGlobalPreferences: (preferences) => axios.post('/global/preferences', preferences),
  play: id => axios.post('/spotify/play', {
    id,
  }),
  getTracks: (number, offset) => axios.get('/spotify/gethistory', {
    params: { number, offset },
  }),
  mostListened: (start, end, timeSplit) => axios.get('/spotify/most_listened', {
    params: { start, end, timeSplit },
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
  bestArtistsPer: (start, end, timeSplit) => axios.get('/spotify/best_artists_per', {
    params: { start, end, timeSplit },
  }),
  differentArtistsPer: (start, end, timeSplit) => axios.get('/spotify/different_artists_per', {
    params: { start, end, timeSplit },
  }),
  setSetting: (settingName, settingValue) => axios.post('/settings', {
    [settingName]: settingValue,
  }),
  timePerHourOfDay: (start, end) => axios.get('/spotify/time_per_hour_of_day', {
    params: { start, end },
  }),
  getArtist: (id) => axios.get(`/artist/${id}`),
  getArtistStats: (id) => axios.get(`/artist/${id}/stats`),
  searchArtists: (str) => axios.get(`/artist/search/${str}`),
  getBestSongs: (start, end, nb, offset) => axios.get('/spotify/top/songs', {
    params: {
      start, end, nb, offset,
    },
  }),
  getBestArtists: (start, end, nb, offset) => axios.get('/spotify/top/artists', {
    params: {
      start, end, nb, offset,
    },
  }),
  getBestAlbums: (start, end, nb, offset) => axios.get('/spotify/top/albums', {
    params: {
      start, end, nb, offset,
    },
  }),
};

export default {
  ...API,
};
