const HOSTNAME_PATTERN =
  /^[A-Za-z0-9]([A-Za-z0-9-]*[A-Za-z0-9])?(\.[A-Za-z0-9]([A-Za-z0-9-]*[A-Za-z0-9])?)*(:[0-9]{1,5})?$/;

export function normalizeS3EndpointHost(rawEndpoint: string, bucket: string): string {
  let normalized = rawEndpoint.trim();

  normalized = normalized.replace(/^https?:\/\//i, "");
  normalized = normalized.replace(/\/+$/, "");

  if (normalized.startsWith(`${bucket}.`)) {
    normalized = normalized.slice(bucket.length + 1);
  }

  if (!HOSTNAME_PATTERN.test(normalized)) {
    throw new Error(
      `Invalid AWS_S3_ENDPOINT value "${rawEndpoint}". Use hostname[:port] only, for example "sfo3.digitaloceanspaces.com".`
    );
  }

  return normalized;
}

export function toS3EndpointUrl(rawEndpoint: string, bucket: string): string {
  const host = normalizeS3EndpointHost(rawEndpoint, bucket);
  return `https://${host}`;
}

export function getUrlOrigin(rawUrl: string): string | null {
  try {
    return new URL(rawUrl).origin;
  } catch {
    return null;
  }
}

export function parseCsvList(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}
