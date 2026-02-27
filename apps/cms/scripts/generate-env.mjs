import { randomBytes } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "../../..");
const examplePath = path.join(repoRoot, ".env.example");
const envPath = path.join(repoRoot, ".env");

const randomSecret = (size = 32) => randomBytes(size).toString("hex");

const replacements = {
  APP_KEYS: Array.from({ length: 4 }, () => randomSecret()).join(","),
  API_TOKEN_SALT: randomSecret(),
  ADMIN_JWT_SECRET: randomSecret(),
  TRANSFER_TOKEN_SALT: randomSecret(),
  JWT_SECRET: randomSecret(),
};

const source = await readFile(examplePath, "utf8");

const output = source
  .split(/\r?\n/)
  .map((line) => {
    if (!line || line.startsWith("#") || !line.includes("=")) {
      return line;
    }

    const [rawKey] = line.split("=", 1);
    const key = rawKey.trim();
    const replacement = replacements[key];

    return replacement ? `${key}=${replacement}` : line;
  })
  .join("\n")
  .replace(/\n?$/, "\n");

await writeFile(envPath, output, "utf8");

console.log(`Generated ${envPath} from ${examplePath}`);
