import path from "path";

type Env = ((key: string, defaultValue?: string) => string) & {
  int: (key: string, defaultValue?: number) => number;
};

export default ({ env }: { env: Env }) => {
  const client = env("DATABASE_CLIENT", "sqlite");

  const connections: Record<string, object> = {
    sqlite: {
      connection: {
        filename: path.join(
          __dirname,
          "..",
          env("DATABASE_FILENAME", ".tmp/data.db")
        ),
      },
      useNullAsDefault: true,
    },
  };

  return {
    connection: {
      client,
      ...connections[client],
      acquireConnectionTimeout: env.int("DATABASE_CONNECTION_TIMEOUT", 60000),
    },
  };
};
