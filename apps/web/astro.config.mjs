import react from "@astrojs/react";
import { defineConfig } from "astro/config";

// https://astro.build/config
console.log(
  `[env-check] Web PUBLIC_CMS_URL = ${process.env.PUBLIC_CMS_URL ?? "MISSING (will use build-time baked value)"}`
);

export default defineConfig({
  integrations: [react()],
  output: "static",
  server: { port: 3000 },
  vite: {
    preview: {
      // Allow all hosts — nginx is the public-facing server, so this is safe.
      allowedHosts: "all",
    },
  },
});
