#!/usr/bin/env node
/**
 * Copy an exports bundle (types, data, app, components) into a target src tree.
 *
 * Usage:
 *   node scripts/copy-export.mjs <bundle> [target]
 *   EXPORT_TARGET=path/to/src node scripts/copy-export.mjs <bundle>
 *
 * Bundles: customer-analytics | marketing-intelligence
 */
import { cpSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

const BUNDLES = {
  "customer-analytics": "exports/customer-analytics",
  "marketing-intelligence": "exports/marketing-intelligence",
  "analytics-feature": "exports/analytics-feature",
  "api-plugin": "exports/api-plugin",
};

const COPY_DIRS = ["types", "data", "app", "components", "lib"];

function usage() {
  console.error(
    "Usage: node scripts/copy-export.mjs <bundle> [target]\n" +
      "       EXPORT_TARGET=path/to/src node scripts/copy-export.mjs <bundle>\n\n" +
      "Bundles:\n" +
      "  customer-analytics      Subscriber lifecycle, cohorts (/customers)\n" +
      "  marketing-intelligence  Behavior, campaigns, plan (/marketing)\n" +
      "  analytics-feature       lib/analytics.ts + API routes (functions only)\n" +
      "  api-plugin              REST/CSV API plugin + visualization UI\n\n" +
      "Examples:\n" +
      "  node scripts/copy-export.mjs customer-analytics your-project/src\n" +
      "  EXPORT_TARGET=analytics-dashboard/src npm run exports:copy:customer"
  );
}

const bundle = process.argv[2];
const exportRoot = bundle ? BUNDLES[bundle] : undefined;

if (!exportRoot) {
  usage();
  process.exit(1);
}

const targetArg = process.argv[3] ?? process.env.EXPORT_TARGET;
if (!targetArg) {
  console.error("Missing target directory. Pass as second argument or set EXPORT_TARGET.\n");
  usage();
  process.exit(1);
}

const sourceRoot = path.join(root, exportRoot);
const targetRoot = path.resolve(root, targetArg);

if (!existsSync(sourceRoot)) {
  console.error(`Export bundle not found: ${sourceRoot}`);
  process.exit(1);
}

console.log(`Copying ${bundle} → ${targetRoot}`);

for (const dir of COPY_DIRS) {
  const from = path.join(sourceRoot, dir);
  const to = path.join(targetRoot, dir);

  if (!existsSync(from)) {
    console.warn(`  skip (missing): ${dir}`);
    continue;
  }

  cpSync(from, to, { recursive: true });
  console.log(`  ✓ ${dir}/`);
}

console.log("Done.");
