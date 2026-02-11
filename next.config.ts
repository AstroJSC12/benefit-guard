import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  reactCompiler: true,
  serverExternalPackages: ["pdf-parse", "pdfjs-dist", "canvas", "tesseract.js", "pdf-to-img"],
  turbopack: {
    resolveAlias: {
      canvas: { browser: "" },
    },
  },
};

export default withSentryConfig(nextConfig, {
  // Upload source maps to Sentry for readable stack traces
  // Requires SENTRY_AUTH_TOKEN, SENTRY_ORG, SENTRY_PROJECT env vars
  sourcemaps: {
    disable: !process.env.SENTRY_AUTH_TOKEN,
  },

  // Route Sentry events through Next.js server to bypass ad-blockers
  tunnelRoute: "/monitoring",

  // Suppress Sentry CLI logs during build unless debugging
  silent: !process.env.CI,

  // Include all client bundles when uploading source maps
  widenClientFileUpload: true,

  // Disable Sentry telemetry
  telemetry: false,

  // Don't fail the build if source map upload fails (e.g. missing auth token)
  errorHandler: (err) => {
    console.warn("Sentry build warning:", err.message);
  },
});
