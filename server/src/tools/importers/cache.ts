import { SpotifyTrack } from '../../database/schemas/track';
import { getWithDefault } from '../env';

const maxCacheSize = getWithDefault('MAX_IMPORT_CACHE_SIZE', 100000);

const cache: Record<string, Record<string, SpotifyTrack>> = {};

function getKey(track: string, artist: string) {
  return `${track}-${artist}`;
}

export function getFromCache(
  userId: string,
  track: string,
  artist: string,
): SpotifyTrack | undefined {
  if (!(userId in cache)) {
    cache[userId] = {};
  }
  return cache[userId][getKey(track, artist)];
}

export function setToCache(
  userId: string,
  track: string,
  artist: string,
  trackObject: SpotifyTrack,
) {
  if (!(userId in cache)) {
    cache[userId] = {};
  }
  const keys = Object.keys(cache[userId]);
  if (keys.length > maxCacheSize) {
    delete cache[userId][keys[0]];
  }
  cache[userId][getKey(track, artist)] = trackObject;
}

export function clearCache(userId: string) {
  cache[userId] = {};
}
