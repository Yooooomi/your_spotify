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
};

export default {
  init,
  setToken,
  ...API,
};
