import util from "node:util";

const isEnabled = () => {
  const raw = process.env.STRAPI_VERBOSE_ERRORS?.trim().toLowerCase();
  return raw === "1" || raw === "true" || raw === "yes" || raw === "on";
};

type StrapiError = Error & {
  status?: number;
  details?: unknown;
};

export default () => {
  return async (ctx: { method: string; url: string }, next: () => Promise<void>) => {
    try {
      await next();
    } catch (error) {
      if (isEnabled()) {
        const e = error as StrapiError;
        const status = e.status ?? "unknown";
        const name = e.name ?? "Error";
        const message = e.message ?? "(no message)";

        strapi.log.error(
          `[error-trace] ${ctx.method} ${ctx.url} status=${status} name=${name} message=${message}`
        );

        if (e.stack) {
          strapi.log.error(e.stack);
        }

        if (e.details !== undefined) {
          strapi.log.error(`[error-trace] details=${util.inspect(e.details, { depth: 8 })}`);
        }
      }

      throw error;
    }
  };
};
