export const API_BASE_URL =
  (import.meta.env.VITE_API_URL as string) || 'https://srv1567353.hstgr.cloud/alerthub/api';

/** Resolves avatar / upload URLs that the backend returns as relative paths. */
export function resolveAssetUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  // Uploads live at /uploads/, not under /api/ — strip the /api suffix for asset paths
  const serverBase = API_BASE_URL.replace(/\/api$/, '');
  return `${serverBase}${url}`;
}

export default API_BASE_URL;
