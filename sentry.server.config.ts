import * as Sentry from "@sentry/nextjs";

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,

    // Capture all server errors
    sampleRate: 1.0,

    // Performance monitoring: sample 20% of server transactions
    tracesSampleRate: 0.2,
  });
}
