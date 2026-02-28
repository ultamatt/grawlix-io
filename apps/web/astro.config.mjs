import react from "@astrojs/react";
import { defineConfig } from "astro/config";

// https://astro.build/config
console.log(
  `[env-check] Web PUBLIC_CMS_URL = ${process.env.PUBLIC_CMS_URL ?? "MISSING (will use build-time baked value)"}`
);

// ALLOWED_HOSTS: comma-separated list of hostnames the Vite preview server will
// accept. Defaults to localhost for local dev. In production, set to your public
// domain(s) so the DNS-rebinding protection stays active.
const allowedHosts = (process.env.ALLOWED_HOSTS ?? "localhost")
  .split(",")
  .map((h) => h.trim())
  .filter(Boolean);

console.log(`[env-check] Web ALLOWED_HOSTS = ${allowedHosts.join(", ")}`);

export default defineConfig({
  integrations: [react()],
  output: "static",
  server: { port: 3000 },
  vite: {
    preview: {
      allowedHosts,
    },
  },
});
