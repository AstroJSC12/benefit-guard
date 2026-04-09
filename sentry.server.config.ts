import * as Sentry from "@sentry/nextjs";

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,

    // Capture all server errors
    sampleRate: 1.0,

    // Performance monitoring: sample 20% of server transactions
    tracesSampleRate: 0.2,

    // Scrub potential PHI from error reports
    beforeSend(event) {
      // Strip request bodies — they may contain chat messages or document content
      if (event.request) {
        delete event.request.data;
        delete event.request.cookies;
      }
      return event;
    },
  });
}
