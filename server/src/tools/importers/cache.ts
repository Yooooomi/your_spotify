import { SpotifyTrack } from '../../database/schemas/track';
import { getWithDefault } from '../env';

const maxCacheSize = getWithDefault('MAX_IMPORT_CACHE_SIZE', 100000);

const cache: Record<string, Record<string, SpotifyTrack>> = {};

function getKey(track: string, artist: string) {
  return `${track}-${artist}`;
}

export function getFromCacheString(userId: string, str: string) {
  if (!(userId in cache)) {
    cache[userId] = {};
  }
  return cache[userId][str];
}

export function getFromCache(
  userId: string,
  track: string,
  artist: string,
): SpotifyTrack | undefined {
  const key = getKey(track, artist);
  return getFromCacheString(userId, key);
}

export function setToCacheString(
  userId: string,
  str: string,
  trackObject: SpotifyTrack,
) {
  if (!(userId in cache)) {
    cache[userId] = {};
  }
  const keys = Object.keys(cache[userId]);
  if (keys.length > maxCacheSize) {
    delete cache[userId][keys[0]];
  }
  cache[userId][str] = trackObject;
}

export function setToCache(
  userId: string,
  track: string,
  artist: string,
  trackObject: SpotifyTrack,
) {
  const key = getKey(track, artist);
  setToCacheString(userId, key, trackObject);
}

export function clearCache(userId: string) {
  cache[userId] = {};
}
