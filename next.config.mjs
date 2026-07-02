/** @type {import('next').NextConfig} */
const isStaticExport = process.env.BUILD_HTML === "1";
const isGithubPages = process.env.GITHUB_PAGES === "1";
// Standalone server output for the Docker/Cloud Run image (set by the Dockerfile).
const isStandalone = process.env.STANDALONE_BUILD === "1";
// Base path for GitHub Pages project sites. Override with PAGES_BASE_PATH
// (e.g. "/voucher-agent"); defaults to "/analytics" for the original repo.
const basePath = isGithubPages
  ? process.env.PAGES_BASE_PATH || "/analytics"
  : "";

const nextConfig = {
  ...(basePath ? { basePath } : {}),
  ...(isStaticExport
    ? {
        output: "export",
        trailingSlash: true,
        images: { unoptimized: true },
      }
    : {
        ...(isStandalone ? { output: "standalone" } : {}),
        async redirects() {
          return [
            { source: "/index.html", destination: "/", permanent: false },
            {
              source: "/agents/:id/index.html",
              destination: "/agents/:id",
              permanent: false,
            },
          ];
        },
      }),
};

export default nextConfig;
