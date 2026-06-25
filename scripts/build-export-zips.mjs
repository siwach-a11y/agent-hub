#!/usr/bin/env node
/**
 * Zip export bundles into analytics-dashboard/public/exports for the Add Files UI.
 */
import { execSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const exportsRoot = path.join(root, "exports");
const publicExports = path.join(root, "analytics-dashboard", "public", "exports");

const BUNDLES = [
  "analytics-feature",
  "api-plugin",
  "customer-analytics",
  "marketing-intelligence",
];

mkdirSync(publicExports, { recursive: true });

for (const id of BUNDLES) {
  const source = path.join(exportsRoot, id);
  if (!existsSync(source)) {
    console.warn(`skip (missing): ${id}`);
    continue;
  }

  const zipPath = path.join(publicExports, `${id}.zip`);
  if (existsSync(zipPath)) rmSync(zipPath);

  execSync(`zip -r "${zipPath}" "${id}"`, { cwd: exportsRoot, stdio: "inherit" });
  console.log(`✓ ${id}.zip`);
}

const staging = path.join(publicExports, ".staging-all");
if (existsSync(staging)) rmSync(staging, { recursive: true, force: true });
mkdirSync(staging, { recursive: true });

for (const id of BUNDLES) {
  const source = path.join(exportsRoot, id);
  if (!existsSync(source)) continue;
  cpSync(source, path.join(staging, id), { recursive: true });
}

const allZip = path.join(publicExports, "analytics-all.zip");
if (existsSync(allZip)) rmSync(allZip);
execSync(`zip -r "${allZip}" .`, { cwd: staging, stdio: "inherit" });
rmSync(staging, { recursive: true, force: true });
console.log("✓ analytics-all.zip");

console.log(`\nOutput: ${publicExports}/`);
