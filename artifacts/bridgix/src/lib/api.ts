export const API_BASE_PATH = (import.meta.env.BASE_URL || "/").replace(/\/+$|^$/g, "/");

export function apiPath(path: string): string {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const normalizedBase = API_BASE_PATH.replace(/\/+$/g, "/");
  const normalizedPath = path.replace(/^\/+/, "");
  const result = `${normalizedBase}${normalizedPath}`.replace(/\/+/g, "/");
  return result.startsWith("/") ? result : `/${result}`;
}

export function apiEndpoint(endpoint: string): string {
  return apiPath(endpoint);
}
