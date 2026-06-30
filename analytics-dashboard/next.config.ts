import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));
const isStaticExport = process.env.BUILD_HTML === "1";
const isGithubPages = process.env.GITHUB_PAGES === "1";
const basePath = isGithubPages ? "/analytics" : "";

const nextConfig: NextConfig = {
  outputFileTracingRoot: projectRoot,
  turbopack: {
    root: projectRoot,
  },
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
    NEXT_PUBLIC_STATIC_DEMO: isStaticExport ? "true" : "",
  },
  ...(basePath ? { basePath } : {}),
  ...(isStaticExport
    ? {
        output: "export",
        trailingSlash: true,
        images: { unoptimized: true },
      }
    : {}),
};

export default nextConfig;
