/**
 * Simple in-memory rate limiter for the public contact-submission endpoint.
 * Limits each IP to MAX_REQUESTS per WINDOW_MS to reduce spam and abuse.
 */

const WINDOW_MS = 60_000; // 1 minute
const MAX_REQUESTS = 5;
const CLEANUP_INTERVAL_MS = 5 * 60_000; // clean up every 5 minutes

interface RateRecord {
  count: number;
  resetAt: number;
}

const records = new Map<string, RateRecord>();

// Periodically remove entries for IPs whose window has expired to prevent unbounded growth.
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of records) {
    if (now > record.resetAt) {
      records.delete(ip);
    }
  }
}, CLEANUP_INTERVAL_MS).unref();

export default (_config: unknown, _: unknown) => {
  return async (
    ctx: { ip?: string; request: { ip?: string }; throw: (status: number, message: string) => never },
    next: () => Promise<void>
  ) => {
    const ip = ctx.ip ?? ctx.request.ip;
    if (!ip) {
      ctx.throw(400, "Unable to determine request origin.");
    }

    const now = Date.now();

    const record = records.get(ip);
    if (!record || now > record.resetAt) {
      records.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    } else {
      record.count += 1;
      if (record.count > MAX_REQUESTS) {
        ctx.throw(429, "Too many requests. Please try again later.");
      }
    }

    await next();
  };
};
