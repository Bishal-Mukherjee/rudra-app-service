const KEY_PREFIX = process.env.REDIS_KEY_PREFIX ?? "rudra:";

export const cacheKey = (key: string): string => `${KEY_PREFIX}${key}`;

export const CACHE_KEYS = {
  questionSet: (type: string) => cacheKey(`question_set:${type.toLowerCase()}`),
  reverseGeocode: (lat: string, lng: string) =>
    cacheKey(`reverse_geocode:${lat},${lng}`),
} as const;

// Tuned for a 128 MB self-hosted Redis instance (allkeys-lru eviction).
export const CACHE_TTL = {
  questionSet: 60 * 60 * 24 * 7, // 7 days — two small keys
  reverseGeocode: 60 * 60 * 24, // 24 hours — unbounded coordinate keys
} as const;
