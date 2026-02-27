import { requireEnv } from "./env";

type Env = (key: string, defaultValue?: string) => string;

export default ({ env }: { env: Env }) => ({
  "users-permissions": {
    config: {
      jwt: {
        expiresIn: "7d",
      },
      jwtSecret: requireEnv(env, "JWT_SECRET"),
    },
  },
});
