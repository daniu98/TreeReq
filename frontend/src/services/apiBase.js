/**
 * Base URL prefix for API calls. In dev, leave VITE_API_BASE unset and the
 * Vite proxy forwards /api → http://localhost:8000 automatically. In prod
 * (Vercel), set VITE_API_BASE=https://your-render-backend.onrender.com.
 */
const RAW = import.meta.env.VITE_API_BASE ?? "";
// Strip trailing slash so callers can use `${API_BASE}/api/...` cleanly.
export const API_BASE = RAW.replace(/\/$/, "");

/** Convenience: prefix a path that already starts with `/api/...`. */
export function apiUrl(path) {
  return `${API_BASE}${path}`;
}
