const API_BASE_URL = import.meta.env.VITE_API_URL?.trim();
export const API_BASE_PATH = API_BASE_URL
  ? API_BASE_URL.replace(/\/+$/g, "")
  : (import.meta.env.BASE_URL || "/").replace(/\/+$/g, "/");

export function apiPath(path: string): string {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const normalizedPath = path.replace(/^\/+/, "");

  if (API_BASE_URL) {
    return `${API_BASE_URL.replace(/\/+$/g, "")}/${normalizedPath}`;
  }

  const normalizedBase = API_BASE_PATH.replace(/\/+$/g, "/");
  const result = `${normalizedBase}${normalizedPath}`.replace(/\/+/g, "/");
  return result.startsWith("/") ? result : `/${result}`;
}

export function apiEndpoint(endpoint: string): string {
  return apiPath(endpoint);
}
