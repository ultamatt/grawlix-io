import * as path from "path";

type Env = ((key: string, defaultValue?: string) => string) & {
  int: (key: string, defaultValue?: number) => number;
};

export default ({ env }: { env: Env }) => {
  return {
    connection: {
      client: "sqlite",
      connection: {
        filename: path.join(process.cwd(), env("DATABASE_FILENAME", ".tmp/data.db")),
      },
      useNullAsDefault: true,
      acquireConnectionTimeout: env.int("DATABASE_CONNECTION_TIMEOUT", 60000),
    },
  };
};
