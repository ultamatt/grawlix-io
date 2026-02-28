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
});
