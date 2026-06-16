#!/usr/bin/env node
import { execSync } from "node:child_process";
import { cpSync, existsSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

console.log("Building for GitHub Pages...\n");
execSync("npm run build:pages", { cwd: root, stdio: "inherit" });

const outDir = path.join(root, "out");
const workDir = mkdtempSync(path.join(tmpdir(), "agenthub-pages-"));

try {
  cpSync(outDir, workDir, { recursive: true });
  writeFileSync(path.join(workDir, ".nojekyll"), "");

  execSync("git init", { cwd: workDir, stdio: "inherit" });
  execSync('git config user.email "github-actions[bot]@users.noreply.github.com"', {
    cwd: workDir,
    stdio: "inherit",
  });
  execSync('git config user.name "github-actions[bot]"', { cwd: workDir, stdio: "inherit" });
  execSync("git add -A", { cwd: workDir, stdio: "inherit" });
  execSync('git commit -m "Deploy GitHub Pages"', { cwd: workDir, stdio: "inherit" });
  execSync("git branch -M gh-pages", { cwd: workDir, stdio: "inherit" });
  execSync("git push -f https://github.com/siwach-a11y/agent-hub.git gh-pages", {
    cwd: workDir,
    stdio: "inherit",
  });

  console.log("\n✓ Published to gh-pages branch");
  console.log("  https://siwach-a11y.github.io/agent-hub/");
} finally {
  rmSync(workDir, { recursive: true, force: true });
}
