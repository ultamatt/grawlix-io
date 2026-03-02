import { requireSecret } from "./env";

type Env = ((key: string, defaultValue?: string) => string) & {
  bool: (key: string, defaultValue?: boolean) => boolean;
};

export default ({ env }: { env: Env }) => ({
  auth: {
    secret: requireSecret(env, "ADMIN_JWT_SECRET", "admin-jwt-secret"),
  },
  apiToken: {
    salt: requireSecret(env, "API_TOKEN_SALT", "api-token-salt"),
  },
  transfer: {
    token: {
      salt: requireSecret(env, "TRANSFER_TOKEN_SALT", "transfer-token-salt"),
    },
  },
  flags: {
    nps: env.bool("FLAG_NPS", true),
    promoteEE: env.bool("FLAG_PROMOTE_EE", true),
  },
});
