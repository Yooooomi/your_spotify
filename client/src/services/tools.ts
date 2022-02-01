import { Album, Artist } from './types';

export const getImage = (value: Artist | Album) => {
  return value.images[0]?.url || '/no_data.png';
};

// @ts-ignore
export const getSpotifyLogUrl = () => `${window.API_ENDPOINT}/oauth/spotify`;
