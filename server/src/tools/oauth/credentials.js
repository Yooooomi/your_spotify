const credentials = {
  spotify: {
    public: process.env.SPOTIFY_PUBLIC,
    secret: process.env.SPOTIFY_SECRET,
    scopes: 'user-read-private user-read-email user-read-recently-played user-modify-playback-state',
    redirectUri: `${process.env.API_ENDPOINT}/oauth/spotify/callback`,
  },
};

module.exports = {
  credentials,
};
