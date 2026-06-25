import type { NumericColumnStat } from "@/types/upload-analytics";

export function normalizeCellValue(value: unknown): string | number {
  if (value === null || value === undefined) return "";
  if (typeof value === "number" && !Number.isNaN(value)) return value;
  const str = String(value).trim();
  const num = Number(str.replace(/,/g, ""));
  if (str !== "" && !Number.isNaN(num) && /^-?\d*\.?\d+$/.test(str.replace(/,/g, ""))) {
    return num;
  }
  return str;
}

export function computeNumericStats(
  columns: string[],
  rows: Record<string, string | number>[]
): NumericColumnStat[] {
  const stats: NumericColumnStat[] = [];

  for (const col of columns) {
    const nums = rows
      .map((r) => r[col])
      .filter((v): v is number => typeof v === "number" && !Number.isNaN(v));
    if (nums.length === 0) continue;
    const sum = nums.reduce((a, b) => a + b, 0);
    stats.push({
      name: col,
      min: Math.min(...nums),
      max: Math.max(...nums),
      avg: sum / nums.length,
      sum,
      count: nums.length,
    });
  }

  return stats;
}
