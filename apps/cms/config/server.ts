import { requireSecretArray } from "./env";

type Env = ((key: string, defaultValue?: string) => string) & {
  int: (key: string, defaultValue?: number) => number;
  bool: (key: string, defaultValue?: boolean) => boolean;
};

export default ({ env }: { env: Env }) => ({
  host: env("HOST", "0.0.0.0"),
  port: env.int("STRAPI_PORT", 1337),
  app: {
    keys: requireSecretArray(env, "APP_KEYS", [
      "app-key-1",
      "app-key-2",
      "app-key-3",
      "app-key-4",
    ]),
  },
  webhooks: {
    populateRelations: env.bool("WEBHOOKS_POPULATE_RELATIONS", false),
  },
});
