#!/usr/bin/env node
/**
 * Pre-compute BNII raw data for static GitHub Pages export.
 */
import { execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const dashboardRoot = path.join(root, "analytics-dashboard");

execSync("npx --yes tsx --tsconfig tsconfig.json ../scripts/generate-bnii-raw-snapshot.ts", {
  cwd: dashboardRoot,
  stdio: "inherit",
  env: {
    ...process.env,
    NEXT_PUBLIC_STATIC_DEMO: "true",
  },
});
