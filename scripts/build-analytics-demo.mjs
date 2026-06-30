#!/usr/bin/env node
import { execSync } from "node:child_process";
import { cpSync, existsSync, renameSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { rewriteStaticPaths } from "./rewrite-static-paths.mjs";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const dashboardRoot = path.join(root, "analytics-dashboard");
const apiPath = path.join(dashboardRoot, "src", "app", "api");
const apiBackup = path.join(dashboardRoot, ".build-api-backup");

function restoreApi() {
  if (!existsSync(apiBackup)) return;
  if (existsSync(apiPath)) {
    rmSync(apiPath, { recursive: true, force: true });
  }
  renameSync(apiBackup, apiPath);
}

function hideApi() {
  if (!existsSync(apiPath)) return;
  if (existsSync(apiBackup)) {
    rmSync(apiBackup, { recursive: true, force: true });
  }
  renameSync(apiPath, apiBackup);
}

const isGithubPages = process.env.GITHUB_PAGES === "1";

console.log(
  isGithubPages
    ? "Building Analytics Dashboard for GitHub Pages...\n"
    : "Building Analytics Dashboard static demo...\n"
);

execSync("node scripts/build-export-zips.mjs", { cwd: root, stdio: "inherit" });

hideApi();

try {
  const nextDir = path.join(dashboardRoot, ".next");
  const outDir = path.join(dashboardRoot, "out");
  if (existsSync(nextDir)) {
    rmSync(nextDir, { recursive: true, force: true });
  }
  if (existsSync(outDir)) {
    rmSync(outDir, { recursive: true, force: true });
  }

  console.log("Generating BNII raw data snapshot...");
  execSync("node scripts/generate-bnii-raw-snapshot.mjs", {
    cwd: root,
    stdio: "inherit",
    env: {
      ...process.env,
      NEXT_PUBLIC_STATIC_DEMO: "true",
    },
  });

  execSync("npm run build", {
    cwd: dashboardRoot,
    stdio: "inherit",
    env: {
      ...process.env,
      BUILD_HTML: "1",
      GITHUB_PAGES: isGithubPages ? "1" : "",
      NEXT_PUBLIC_STATIC_DEMO: "true",
    },
  });

  // Drop dev-server artifacts if a local `next dev` left them in out/
  for (const stray of ["development", "webpack"]) {
    const strayDir = path.join(outDir, "_next", "static", stray);
    if (existsSync(strayDir)) rmSync(strayDir, { recursive: true, force: true });
  }

  // Flat RSC payloads for client router prefetch (trailingSlash export)
  for (const route of ["customers", "marketing", "raw-data", "workspace/u9"]) {
    const nested = path.join(outDir, route, "index.txt");
    const flat = path.join(outDir, `${route}.txt`);
    if (existsSync(nested)) cpSync(nested, flat);
  }

  if (!isGithubPages) {
    rewriteStaticPaths(outDir);
  }

  console.log("\n✓ Static site exported to analytics-dashboard/out/");

  if (isGithubPages) {
    writeFileSync(path.join(outDir, ".nojekyll"), "");
    console.log("  GitHub Pages base path: /analytics/");
  } else {
    const demoDir = path.join(root, "analytics-dashboard-demo");
    if (existsSync(demoDir)) {
      rmSync(demoDir, { recursive: true, force: true });
    }
    cpSync(outDir, demoDir, { recursive: true });

    writeFileSync(
      path.join(demoDir, "OPEN-DEMO.command"),
      `#!/bin/bash
cd "$(dirname "$0")"
echo "========================================"
echo "  Analytics Dashboard Demo"
echo "  Open: http://localhost:3457"
echo "  Do NOT open index.html directly."
echo "  Press Ctrl+C to stop."
echo "========================================"
npx --yes serve . -p 3457
`
    );
    execSync(`chmod +x "${path.join(demoDir, "OPEN-DEMO.command")}"`);

    const zipPath = path.join(root, "analytics-dashboard-demo.zip");
    if (existsSync(zipPath)) rmSync(zipPath);
    execSync(`cd "${demoDir}" && zip -r "${zipPath}" .`, { stdio: "inherit" });

    console.log("  Demo folder: analytics-dashboard-demo/");
    console.log("  Zip archive: analytics-dashboard-demo.zip");
    console.log("  Serve:   npx serve analytics-dashboard-demo -p 3457");
    console.log("  Or run:  analytics-dashboard-demo/OPEN-DEMO.command");
    console.log("  Offline: open analytics-dashboard-demo/index.html");
  }
} catch (error) {
  console.error("\n✗ Analytics dashboard static build failed.");
  process.exitCode = 1;
} finally {
  restoreApi();
}
