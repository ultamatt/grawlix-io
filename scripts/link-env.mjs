/**
 * Creates symlinks so each app's .env points to the repository root .env.
 *
 * - apps/cms/.env  →  ../../.env
 * - apps/web/.env  →  ../../.env
 *
 * Skipped silently when no root .env exists (e.g. Docker builds, CI — env
 * vars are injected directly in those environments).
 *
 * Usage:
 *   node scripts/link-env.mjs
 *
 * Runs automatically via the `predev` and `prebuild` hooks in package.json.
 */

import { existsSync, lstatSync, symlinkSync, unlinkSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..");
const rootEnvPath = path.join(repoRoot, ".env");

if (!existsSync(rootEnvPath)) {
  console.log(
    "link-env: no root .env found — skipping symlinks (env vars must be set externally)."
  );
  process.exit(0);
}

/** Relative path from the symlink location to the target. */
const LINKS = [
  { link: path.join(repoRoot, "apps", "cms", ".env"), target: path.join("..", "..", ".env") },
  { link: path.join(repoRoot, "apps", "web", ".env"), target: path.join("..", "..", ".env") },
];

for (const { link, target } of LINKS) {
  const rel = path.relative(repoRoot, link);

  if (existsSync(link)) {
    const stat = lstatSync(link);
    if (stat.isSymbolicLink()) {
      // Already linked — nothing to do.
      console.log(`link-env: ${rel} already linked`);
      continue;
    }
    // A real file exists (e.g. a leftover app-specific .env). Remove it so
    // the developer relies on the shared root one.
    unlinkSync(link);
    console.log(`link-env: removed existing ${rel} (replaced with symlink)`);
  }

  symlinkSync(target, link);
  console.log(`link-env: linked ${rel} → ${target}`);
}
