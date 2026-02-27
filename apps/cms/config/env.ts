type Env = (key: string, defaultValue?: string) => string | undefined;

const FORBIDDEN_PREFIXES = ["replace-me", "change-me", "your-"];

const validateValue = (key: string, value: string | undefined) => {
  if (typeof value !== "string") {
    throw new Error(
      `Missing environment variable "${key}". Set it in apps/cms/.env before starting Strapi.`
    );
  }

  const normalized = value.trim().toLowerCase();
  const isPlaceholder = FORBIDDEN_PREFIXES.some(
    (prefix) => normalized === prefix || normalized.startsWith(`${prefix}-`)
  );

  if (value.trim().length === 0 || isPlaceholder) {
    throw new Error(
      `Invalid environment variable "${key}". Set a real value in apps/cms/.env before starting Strapi.`
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
      `Invalid environment variable "${key}". Set a comma-separated value in apps/cms/.env before starting Strapi.`
    );
  }

  for (const value of values) {
    validateValue(key, value);
  }

  return values;
};
