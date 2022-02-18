import { Album, Artist } from './types';

export const getImage = (value: Artist | Album | undefined) => {
  return value?.images[0]?.url || '/no_data_faded.png';
};

// @ts-ignore
export const getSpotifyLogUrl = () => `${window.API_ENDPOINT}/oauth/spotify`;
