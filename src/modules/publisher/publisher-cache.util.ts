export const PUBLISHER_CACHE_PREFIX = 'publisher';

export const getPublisherListCacheKey = (includeWebsites: boolean) =>
  `${PUBLISHER_CACHE_PREFIX}:all:${
    includeWebsites ? 'with-websites' : 'basic'
  }`;

export const getPublisherDetailCacheKey = (
  id: number,
  includeWebsites: boolean,
) =>
  `${PUBLISHER_CACHE_PREFIX}:id:${id}:${
    includeWebsites ? 'with-websites' : 'basic'
  }`;

export const getPublisherInvalidationKeys = (id?: number) => {
  const keys = [
    getPublisherListCacheKey(false),
    getPublisherListCacheKey(true),
  ];

  if (typeof id === 'number') {
    keys.push(
      getPublisherDetailCacheKey(id, false),
      getPublisherDetailCacheKey(id, true),
    );
  }

  return keys;
};
