import { get } from '../env';

export const credentials = {
  spotify: {
    public: get('SPOTIFY_PUBLIC'),
    secret: get('SPOTIFY_SECRET'),
    scopes:
      'user-read-private user-read-email user-read-recently-played user-modify-playback-state',
    redirectUri: `http://localhost/api/oauth/spotify/callback`,
  },
};
