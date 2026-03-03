import { getUrlOrigin, normalizeS3EndpointHost, parseCsvList } from "./s3";

const bucket = process.env.AWS_S3_BUCKET?.trim();
const rawEndpoint = process.env.AWS_S3_ENDPOINT?.trim();
const rawBaseUrl = process.env.AWS_S3_BASE_URL?.trim();
const rawExtraConnectSrc = process.env.CSP_CONNECT_SRC_EXTRA?.trim();

const spacesOrigins = new Set<string>();
const connectOrigins = new Set<string>(["'self'", "https://market-assets.strapi.io", "https://analytics.strapi.io"]);

if (rawBaseUrl) {
  const baseOrigin = getUrlOrigin(rawBaseUrl);
  if (baseOrigin) {
    spacesOrigins.add(baseOrigin);
  }
}

if (rawEndpoint && bucket) {
  try {
    const endpointHost = normalizeS3EndpointHost(rawEndpoint, bucket);
    spacesOrigins.add(`https://${endpointHost}`);
    spacesOrigins.add(`https://${bucket}.${endpointHost}`);
  } catch {
    // Ignore invalid endpoint here; upload config will throw a startup error.
  }
}

for (const origin of spacesOrigins) {
  connectOrigins.add(origin);
}

for (const candidate of parseCsvList(rawExtraConnectSrc)) {
  if (candidate === "'self'" || candidate === "https:" || candidate === "http:" || candidate === "wss:" || candidate === "ws:") {
    connectOrigins.add(candidate);
    continue;
  }

  const origin = getUrlOrigin(candidate);
  if (origin) {
    connectOrigins.add(origin);
  }
}

const allowedMediaOrigins = [...spacesOrigins];
const allowedConnectOrigins = [...connectOrigins];

export default [
  "strapi::logger",
  "strapi::errors",
  "global::error-logger",
  {
    name: "strapi::security",
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          "connect-src": allowedConnectOrigins,
          "img-src": ["'self'", "data:", "blob:", "https://market-assets.strapi.io", ...allowedMediaOrigins],
          "media-src": ["'self'", "data:", "blob:", ...allowedMediaOrigins],
          upgradeInsecureRequests: null,
        },
      },
    },
  },
  "strapi::cors",
  "strapi::poweredBy",
  "strapi::query",
  "strapi::body",
  "strapi::session",
  "strapi::favicon",
  "strapi::public",
];
