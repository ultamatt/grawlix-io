import * as path from "path";
import { accessSync, constants, mkdirSync } from "fs";
import { requireEnv } from "./env";

type Env = ((key: string, defaultValue?: string) => string) & {
  int: (key: string, defaultValue?: number) => number;
};

export default ({ env }: { env: Env }) => {
  const configuredFilename = requireEnv(env, "DATABASE_FILENAME");
  const filename = path.isAbsolute(configuredFilename)
    ? configuredFilename
    : path.join(process.cwd(), configuredFilename);
  const dbDir = path.dirname(filename);

  // Fail fast with a clear error if the DB directory is not writable.
  try {
    mkdirSync(dbDir, { recursive: true });
    accessSync(dbDir, constants.W_OK);
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(`SQLite directory is not writable: ${dbDir}. ${detail}`);
  }

  return {
    connection: {
      client: "sqlite",
      connection: {
        filename,
      },
      useNullAsDefault: true,
      acquireConnectionTimeout: env.int("DATABASE_CONNECTION_TIMEOUT", 60000),
    },
  };
};
