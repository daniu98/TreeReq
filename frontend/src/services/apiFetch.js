import { API_BASE } from "./apiBase.js";

/**
 * Parse JSON from a fetch Response; surface misconfigured production deploys.
 */
export async function parseApiJson(response, pathHint = "/api") {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    if (text.trim().toLowerCase().startsWith("<!doctype") || text.trim().startsWith("<html")) {
      throw new Error(
        "The server returned a web page instead of API data. On treereq.me, set BACKEND_URL " +
          "(Vercel proxy) or VITE_API_BASE (direct to your FastAPI host) in project environment variables."
      );
    }
    throw new Error(
      response.status === 404
        ? `API route not found (${pathHint}). Is the backend deployed and reachable?`
        : `Invalid API response (${response.status}).`
    );
  }
}

export function wrapFetchError(err) {
  if (err instanceof TypeError) {
    const hint =
      import.meta.env.PROD && !API_BASE
        ? " On production, configure BACKEND_URL or VITE_API_BASE in Vercel and redeploy."
        : " Is the backend running on port 8000?";
    return new Error(`Cannot reach the TreeReq API.${hint}`);
  }
  return err;
}

export async function apiFetch(path, options) {
  try {
    return await fetch(path, options);
  } catch (err) {
    throw wrapFetchError(err);
  }
}
