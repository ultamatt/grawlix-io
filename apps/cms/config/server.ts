import { requireEnvArray } from "./env";

type Env = ((key: string, defaultValue?: string) => string) & {
  int: (key: string, defaultValue?: number) => number;
  bool: (key: string, defaultValue?: boolean) => boolean;
};

export default ({ env }: { env: Env }) => ({
  host: env("HOST", "0.0.0.0"),
  port: env.int("STRAPI_PORT", 1337),
  app: {
    keys: requireEnvArray(env, "APP_KEYS"),
  },
  webhooks: {
    populateRelations: env.bool("WEBHOOKS_POPULATE_RELATIONS", false),
  },
});
