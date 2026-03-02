import * as path from "path";
import { accessSync, constants, mkdirSync } from "fs";

type Env = ((key: string, defaultValue?: string) => string) & {
  int: (key: string, defaultValue?: number) => number;
};

export default ({ env }: { env: Env }) => {
  const configuredFilename = env("DATABASE_FILENAME", ".tmp/data.db");
  const filename = path.isAbsolute(configuredFilename)
    ? configuredFilename
    : path.join(process.cwd(), configuredFilename);
  const dbDir = path.dirname(filename);

  // Fail fast with a clear error if the DB directory is not writable/searchable.
  try {
    mkdirSync(dbDir, { recursive: true });
    accessSync(dbDir, constants.W_OK | constants.X_OK);
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(`SQLite directory is not writable/searchable: ${dbDir}. ${detail}`);
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
