const bucket = process.env.AWS_S3_BUCKET?.trim();
const rawEndpoint = process.env.AWS_S3_ENDPOINT?.trim();
const rawBaseUrl = process.env.AWS_S3_BASE_URL?.trim();

const spacesOrigins = new Set<string>();

if (rawBaseUrl) {
  try {
    spacesOrigins.add(new URL(rawBaseUrl).origin);
  } catch {
    // Ignore invalid base URL; upload config already validates endpoint format.
  }
}

if (rawEndpoint) {
  const endpointHost = rawEndpoint.replace(/^https?:\/\//i, "").replace(/\/+$/, "");
  spacesOrigins.add(`https://${endpointHost}`);
  if (bucket) {
    spacesOrigins.add(`https://${bucket}.${endpointHost}`);
  }
}

const allowedMediaOrigins = [...spacesOrigins];

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
          "connect-src": ["'self'", "https:"],
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
