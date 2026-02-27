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

import { lstatSync, readlinkSync, statSync, symlinkSync, unlinkSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..");
const rootEnvPath = path.join(repoRoot, ".env");

let rootEnvExists = false;
try {
  // statSync follows symlinks — ensures the root .env is actually readable,
  // not just a broken symlink that lstatSync would accept.
  statSync(rootEnvPath);
  rootEnvExists = true;
} catch {
  rootEnvExists = false;
}

if (!rootEnvExists) {
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

  let stat = null;
  try {
    stat = lstatSync(link);
  } catch {
    // Nothing at this path — safe to create symlink.
  }

  if (stat !== null) {
    if (stat.isSymbolicLink()) {
      const currentTarget = readlinkSync(link);
      if (currentTarget === target) {
        // Already points to the correct target — nothing to do.
        console.log(`link-env: ${rel} already linked`);
        continue;
      }
      // Broken or stale symlink — remove and re-link.
      unlinkSync(link);
      console.log(`link-env: removed stale symlink ${rel}`);
    } else {
      // A real file exists. Refuse to delete it — the developer may have
      // intentionally placed app-specific config there.
      console.error(
        `link-env: ${rel} is a real file, not a symlink. Remove it manually and re-run to create the shared symlink.`
      );
      process.exitCode = 1;
      continue;
    }
  }

  symlinkSync(target, link);
  console.log(`link-env: linked ${rel} → ${target}`);
}
