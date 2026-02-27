const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const asRecord = (value: unknown): Record<string, unknown> => {
  if (!value || typeof value !== "object") {
    return {};
  }

  return value as Record<string, unknown>;
};

const parseString = (
  input: unknown,
  field: string,
  { min = 1, max = 500 }: { min?: number; max?: number } = {}
): string => {
  if (typeof input !== "string") {
    throw new Error(`"${field}" must be a string`);
  }

  const value = input.trim();
  if (value.length < min) {
    throw new Error(`"${field}" must be at least ${min} characters`);
  }
  if (value.length > max) {
    throw new Error(`"${field}" must be at most ${max} characters`);
  }

  return value;
};

export default {
  async create(ctx: { request: { body: unknown }; status: number; body: object; throw: Function }) {
    try {
      const rootBody = asRecord(ctx.request.body);
      const payload = asRecord(rootBody.data ?? rootBody);

      const name = parseString(payload.name, "name", { min: 2, max: 120 });
      const email = parseString(payload.email, "email", { min: 5, max: 320 }).toLowerCase();
      const message = parseString(payload.message, "message", { min: 10, max: 4000 });

      if (!EMAIL_REGEX.test(email)) {
        throw new Error("\"email\" must be a valid email address");
      }

      const entry = await strapi.entityService.create("api::contact-submission.contact-submission", {
        data: {
          name,
          email,
          message,
          source: "website",
          submittedAt: new Date().toISOString(),
        },
      });

      ctx.status = 201;
      ctx.body = {
        data: {
          id: entry.id,
        },
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to process the contact submission";
      ctx.throw(400, message);
    }
  },
};
