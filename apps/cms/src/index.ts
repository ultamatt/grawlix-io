const present = (val: string | undefined) =>
  val ? `set (${val.length} chars)` : "MISSING";

const source = (explicit: string | undefined, appSecret: string | undefined) => {
  if (explicit) {
    return `explicit (${explicit.length} chars)`;
  }
  if (appSecret) {
    return "derived from APP_SECRET";
  }
  return "MISSING";
};

export default {
  register(/* { strapi }: { strapi: Core.Strapi } */) {},
  bootstrap(/* { strapi }: { strapi: Core.Strapi } */) {
    console.log("[env-check] CMS environment variables:");
    console.log(`  DATABASE_FILENAME   = ${process.env.DATABASE_FILENAME ?? "MISSING"}`);
    console.log(`  STRAPI_PORT         = ${process.env.STRAPI_PORT ?? "MISSING (defaulting to 1337)"}`);
    console.log(`  AWS_S3_BUCKET       = ${process.env.AWS_S3_BUCKET ?? "MISSING (using local uploads)"}`);
    console.log(`  AWS_S3_REGION       = ${process.env.AWS_S3_REGION ?? "default (us-east-1)"}`);
    console.log(`  APP_SECRET          = ${present(process.env.APP_SECRET)}`);
    console.log(`  ADMIN_JWT_SECRET    = ${source(process.env.ADMIN_JWT_SECRET, process.env.APP_SECRET)}`);
    console.log(`  JWT_SECRET          = ${source(process.env.JWT_SECRET, process.env.APP_SECRET)}`);
    console.log(`  API_TOKEN_SALT      = ${source(process.env.API_TOKEN_SALT, process.env.APP_SECRET)}`);
    console.log(`  TRANSFER_TOKEN_SALT = ${source(process.env.TRANSFER_TOKEN_SALT, process.env.APP_SECRET)}`);
    console.log(`  APP_KEYS            = ${source(process.env.APP_KEYS, process.env.APP_SECRET)}`);
  },
};
