export const API_BASE_URL =
  (import.meta.env.VITE_API_URL as string) || 'https://srv1567353.hstgr.cloud/alerthub/api';

/** Resolves avatar / upload URLs that the backend returns as relative paths. */
export function resolveAssetUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${API_BASE_URL}${url}`;
}

export default API_BASE_URL;
