import { requireEnv, requireSecret } from "./env";

type Env = ((key: string, defaultValue?: string) => string) & {
  bool: (key: string, defaultValue?: boolean) => boolean;
};

function normalizeS3Endpoint(rawEndpoint: string, bucket: string): string {
  let normalized = rawEndpoint.trim();

  normalized = normalized.replace(/^https?:\/\//i, "");
  normalized = normalized.replace(/\/+$/, "");

  if (normalized.startsWith(`${bucket}.`)) {
    normalized = normalized.slice(bucket.length + 1);
  }

  const hostnamePattern =
    /^[A-Za-z0-9]([A-Za-z0-9-]*[A-Za-z0-9])?(\.[A-Za-z0-9]([A-Za-z0-9-]*[A-Za-z0-9])?)*(:[0-9]{1,5})?$/;

  if (!hostnamePattern.test(normalized)) {
    throw new Error(
      `Invalid AWS_S3_ENDPOINT value "${rawEndpoint}". Use hostname[:port] only, for example "sfo3.digitaloceanspaces.com".`
    );
  }

  return `https://${normalized}`;
}

export default ({ env }: { env: Env }) => {
  const plugins: Record<string, unknown> = {
    "users-permissions": {
      config: {
        jwt: {
          expiresIn: "7d",
        },
        jwtSecret: requireSecret(env, "JWT_SECRET", "jwt-secret"),
      },
    },
  };

  const s3Bucket = env("AWS_S3_BUCKET")?.trim();
  if (s3Bucket) {
    const region = env("AWS_S3_REGION", env("AWS_REGION", "us-east-1"));

    const s3Options: Record<string, unknown> = {
      credentials: {
        accessKeyId: requireEnv(env, "AWS_ACCESS_KEY_ID"),
        secretAccessKey: requireEnv(env, "AWS_SECRET_ACCESS_KEY"),
      },
      region,
      forcePathStyle: env.bool("AWS_S3_FORCE_PATH_STYLE", false),
      params: {
        Bucket: s3Bucket,
        ACL: env("AWS_S3_ACL", "public-read"),
      },
    };

    const endpoint = env("AWS_S3_ENDPOINT");
    if (endpoint) {
      s3Options.endpoint = normalizeS3Endpoint(endpoint, s3Bucket);
    }

    const baseUrl = env("AWS_S3_BASE_URL");

    plugins.upload = {
      config: {
        provider: "aws-s3",
        providerOptions: {
          ...(baseUrl ? { baseUrl } : {}),
          s3Options,
        },
      },
    };
  }

  return plugins;
};
