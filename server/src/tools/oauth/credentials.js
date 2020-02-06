const credentials = {
  spotify: {
    public: '1bda6c1687914623bab9fbee30595f52',
    secret: '2508ed3146da425f9c3494a77ce994a1',
    scopes: 'user-read-private user-read-email user-read-recently-played',
    redirectUri: 'http://localhost:8080/oauth/spotify/callback',
  }
}

module.exports = {
  credentials,
};
