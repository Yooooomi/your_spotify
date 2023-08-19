import { get } from '../env';

export const credentials = {
  spotify: {
    public: get('SPOTIFY_PUBLIC'),
    secret: get('SPOTIFY_SECRET'),
    scopesAll: [
      'user-read-private',
      'user-read-email',
      'user-read-recently-played',
      'user-modify-playback-state',
      'playlist-modify-private',
      'playlist-modify-public',
    ].join(' '),
    scopesReadOnly: [
      'user-read-private',
      'user-read-email',
      'user-read-recently-played',
    ].join(' '),
    redirectUri: `${get('API_ENDPOINT')}/oauth/spotify/callback`,
  },
};
