import { writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { fetchAllRawDataSummaries } from "../analytics-dashboard/src/lib/bnii/raw-data-service.ts";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const outPath = path.join(root, "analytics-dashboard", "src", "data", "bnii-raw-data-snapshot.json");

async function main() {
  const snapshot = await fetchAllRawDataSummaries();
  writeFileSync(outPath, `${JSON.stringify(snapshot, null, 2)}\n`);
  console.log(`✓ BNII raw data snapshot → ${path.relative(root, outPath)}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
