import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  serverExternalPackages: ["pdf-parse"],
  turbopack: {
    resolveAlias: {
      canvas: { browser: "" },
    },
  },
};

export default nextConfig;
