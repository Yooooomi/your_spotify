import { SpotifyTrack } from "../../database/schemas/track";
import { getWithDefault } from "../env";

const maxCacheSize = getWithDefault("MAX_IMPORT_CACHE_SIZE", 100000);

export type SpotifyTrackCacheItem =
  | {
      exists: false;
    }
  | { exists: true; track: SpotifyTrack };

const cache: Record<string, Record<string, SpotifyTrackCacheItem>> = {};

function getKey(track: string, artist: string) {
  return `${track}-${artist}`;
}

export function getFromCacheString(userId: string, str: string) {
  if (!(userId in cache)) {
    cache[userId] = {};
  }
  return cache[userId]?.[str];
}

export function getFromCache(
  userId: string,
  track: string,
  artist: string,
): SpotifyTrackCacheItem | undefined {
  const key = getKey(track, artist);
  return getFromCacheString(userId, key);
}

export function setToCacheString(
  userId: string,
  str: string,
  trackObject: SpotifyTrackCacheItem,
) {
  const userCache = cache[userId] ?? {};
  const keys = Object.keys(cache[userId] ?? {});
  const [firstKey] = keys;
  if (keys.length > maxCacheSize && firstKey) {
    delete cache[userId]?.[firstKey];
  }
  userCache[str] = trackObject;
  cache[userId] = userCache;
}

export function setToCache(
  userId: string,
  track: string,
  artist: string,
  trackObject: SpotifyTrackCacheItem,
) {
  const key = getKey(track, artist);
  setToCacheString(userId, key, trackObject);
}

export function clearCache(userId: string) {
  cache[userId] = {};
}
