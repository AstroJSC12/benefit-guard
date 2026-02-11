import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval';
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com;
  img-src 'self' data: blob: https://maps.googleapis.com https://lh3.googleusercontent.com https://places.googleapis.com;
  connect-src 'self' https://*.ingest.us.sentry.io https://api.openai.com https://npiregistry.cms.hhs.gov https://places.googleapis.com https://maps.googleapis.com;
  frame-src 'none';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
`.replace(/\n/g, "");

const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-XSS-Protection", value: "1; mode=block" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
  { key: "Content-Security-Policy", value: ContentSecurityPolicy },
];

const nextConfig: NextConfig = {
  reactCompiler: true,
  serverExternalPackages: ["pdf-parse", "pdfjs-dist", "canvas", "tesseract.js", "pdf-to-img"],
  turbopack: {
    resolveAlias: {
      canvas: { browser: "" },
    },
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
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
