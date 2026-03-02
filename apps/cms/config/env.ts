import { createHmac } from "node:crypto";

type Env = (key: string, defaultValue?: string) => string | undefined;

const FORBIDDEN_PREFIXES = ["replace-me", "change-me", "your-"];
const DERIVATION_NAMESPACE = "grawlix-strapi";

const validateValue = (key: string, value: string | undefined) => {
  if (typeof value !== "string") {
    throw new Error(
      `Missing environment variable "${key}". Set it in the repository root .env before starting Strapi.`
    );
  }

  const normalized = value.trim().toLowerCase();
  const isPlaceholder = FORBIDDEN_PREFIXES.some(
    (prefix) => normalized === prefix || normalized.startsWith(`${prefix}-`)
  );

  if (value.trim().length === 0 || isPlaceholder) {
    throw new Error(
      `Invalid environment variable "${key}". Set a real value in the repository root .env before starting Strapi.`
    );
  }
};

export const requireEnv = (env: Env, key: string): string => {
  const value = env(key);
  validateValue(key, value);
  return value;
};

export const requireEnvArray = (env: Env, key: string): string[] => {
  const raw = requireEnv(env, key);
  const values = raw.split(",").map((value) => value.trim()).filter(Boolean);

  if (values.length === 0) {
    throw new Error(
      `Invalid environment variable "${key}". Set a comma-separated value in the repository root .env before starting Strapi.`
    );
  }

  for (const value of values) {
    validateValue(key, value);
  }

  return values;
};

const deriveSecret = (appSecret: string, scope: string): string => {
  return createHmac("sha256", appSecret).update(`${DERIVATION_NAMESPACE}:${scope}`).digest("hex");
};

export const requireSecret = (env: Env, key: string, scope: string): string => {
  const explicit = env(key);
  if (typeof explicit === "string") {
    validateValue(key, explicit);
    return explicit;
  }

  const appSecret = requireEnv(env, "APP_SECRET");
  return deriveSecret(appSecret, scope);
};

export const requireSecretArray = (env: Env, key: string, scopes: string[]): string[] => {
  const explicit = env(key);
  if (typeof explicit === "string") {
    validateValue(key, explicit);
    const values = explicit.split(",").map((value) => value.trim()).filter(Boolean);
    if (values.length === 0) {
      throw new Error(
        `Invalid environment variable "${key}". Set a comma-separated value in the repository root .env before starting Strapi.`
      );
    }

    for (const value of values) {
      validateValue(key, value);
    }

    return values;
  }

  const appSecret = requireEnv(env, "APP_SECRET");
  return scopes.map((scope) => deriveSecret(appSecret, scope));
};
