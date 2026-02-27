import { requireEnv } from "./env";

type Env = ((key: string, defaultValue?: string) => string) & {
  bool: (key: string, defaultValue?: boolean) => boolean;
};

export default ({ env }: { env: Env }) => ({
  auth: {
    secret: requireEnv(env, "ADMIN_JWT_SECRET"),
  },
  apiToken: {
    salt: requireEnv(env, "API_TOKEN_SALT"),
  },
  transfer: {
    token: {
      salt: requireEnv(env, "TRANSFER_TOKEN_SALT"),
    },
  },
  flags: {
    nps: env.bool("FLAG_NPS", true),
    promoteEE: env.bool("FLAG_PROMOTE_EE", true),
  },
});
