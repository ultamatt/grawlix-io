const present = (val: string | undefined) =>
  val ? `set (${val.length} chars)` : "MISSING";

export default {
  register(/* { strapi }: { strapi: Core.Strapi } */) {},
  bootstrap(/* { strapi }: { strapi: Core.Strapi } */) {
    console.log("[env-check] CMS environment variables:");
    console.log(`  DATABASE_FILENAME   = ${process.env.DATABASE_FILENAME ?? "MISSING"}`);
    console.log(`  ADMIN_JWT_SECRET    = ${present(process.env.ADMIN_JWT_SECRET)}`);
    console.log(`  JWT_SECRET          = ${present(process.env.JWT_SECRET)}`);
    console.log(`  API_TOKEN_SALT      = ${present(process.env.API_TOKEN_SALT)}`);
    console.log(`  TRANSFER_TOKEN_SALT = ${present(process.env.TRANSFER_TOKEN_SALT)}`);
    console.log(`  APP_KEYS            = ${present(process.env.APP_KEYS)}`);
  },
};
