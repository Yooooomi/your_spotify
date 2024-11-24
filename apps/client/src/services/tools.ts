import { Album, Artist, SpotifyImage } from "./types";

const NO_DATA_IMAGE = "/no_data_faded.png";
const PIXEL_RATIO = window.devicePixelRatio ?? 1;

export const getImage = (value: Artist | Album | undefined) =>
  value?.images[0]?.url || NO_DATA_IMAGE;

export function getAtLeastImage(images: SpotifyImage[], size: number) {
  const realSize = size * PIXEL_RATIO;
  const sorted = [...images].sort(
    (a, b) => a.width + a.height - (b.width + b.height),
  );
  return (
    sorted.find(s => s.width > realSize && s.height > realSize)?.url ??
    sorted[sorted.length - 1]?.url ??
    NO_DATA_IMAGE
  );
}

// @ts-ignore
export const getApiEndpoint = () => window.API_ENDPOINT as string;

export const getSpotifyLogUrl = () => `${getApiEndpoint()}/oauth/spotify`;

export const compact = <T>(arr: (T | undefined)[]): T[] =>
  arr.filter(a => a != null) as T[];

export const conditionalEntry = <T>(value: T, state: boolean) => {
  return state ? value : undefined;
};

export function getMinOfArray<T>(
  array: T[],
  fn: (item: T) => number,
): { minIndex: number; minValue: number } | null {
  if (array.length === 0) {
    return null;
  }
  let minIndex = 0;
  let min = fn(array[0]!);

  for (let i = 1; i < array.length; i += 1) {
    const value = fn(array[i]!);
    if (value < min) {
      minIndex = i;
      min = value;
    }
  }
  return { minValue: min, minIndex };
}
