/**
 * When BACKEND_URL is set (Vercel env), rewrite /api/* to the FastAPI host so
 * production can use same-origin fetch (no VITE_API_BASE required).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frontendRoot = path.resolve(__dirname, "..");
const backend = (process.env.BACKEND_URL || "").replace(/\/$/, "");

const rewrites = [];

if (backend) {
  rewrites.push({
    source: "/api/:path*",
    destination: `${backend}/api/:path*`,
  });
  console.log(`[prepare-vercel] Proxy /api → ${backend}/api`);
} else {
  console.warn(
    "[prepare-vercel] BACKEND_URL not set — /api on treereq.me will not reach FastAPI. " +
      "Set BACKEND_URL or VITE_API_BASE in Vercel project settings."
  );
}

rewrites.push({ source: "/(.*)", destination: "/index.html" });

const vercelJson = { rewrites };
fs.writeFileSync(
  path.join(frontendRoot, "vercel.json"),
  `${JSON.stringify(vercelJson, null, 2)}\n`
);
