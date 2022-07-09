import { Album, Artist } from './types';

export const getImage = (value: Artist | Album | undefined) =>
  value?.images[0]?.url || '/no_data_faded.png';

// @ts-ignore
export const getSpotifyLogUrl = () => `${window.API_ENDPOINT}/oauth/spotify`;

export const compact = <T>(arr: (T | undefined)[]): T[] =>
  arr.filter(a => a != null) as T[];

export function getMinOfArray<T>(
  array: T[],
  fn: (item: T) => number,
): { minIndex: number; minValue: number } | null {
  if (array.length === 0) {
    return null;
  }
  let minIndex = 0;
  let min = fn(array[0]);

  for (let i = 1; i < array.length; i += 1) {
    const value = fn(array[i]);
    if (value < min) {
      minIndex = i;
      min = value;
    }
  }
  return { minValue: min, minIndex };
}
