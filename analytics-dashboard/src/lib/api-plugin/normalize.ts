import { normalizeCellValue } from "@/lib/data-stats";

export function normalizeJsonToRows(data: unknown): {
  columns: string[];
  rows: Record<string, string | number>[];
} {
  let array: Record<string, unknown>[] = [];

  if (Array.isArray(data)) {
    array = data.filter((item) => item && typeof item === "object") as Record<string, unknown>[];
  } else if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    for (const key of ["data", "results", "items", "rows", "records", "users"]) {
      if (Array.isArray(obj[key])) {
        array = obj[key] as Record<string, unknown>[];
        break;
      }
    }
    if (array.length === 0) {
      return {
        columns: ["key", "value"],
        rows: Object.entries(obj)
          .slice(0, 40)
          .map(([k, v]) => ({
            key: k,
            value: normalizeCellValue(v),
          })),
      };
    }
  }

  if (array.length === 0) {
    return { columns: [], rows: [] };
  }

  const columns = [
    ...new Set(
      array.flatMap((row) => Object.keys(row as object))
    ),
  ];

  const rows = array.slice(0, 500).map((row) => {
    const record: Record<string, string | number> = {};
    columns.forEach((col) => {
      record[col] = normalizeCellValue((row as Record<string, unknown>)[col]);
    });
    return record;
  });

  return { columns, rows };
}

export function parseCsvToRows(text: string): {
  columns: string[];
  rows: Record<string, string | number>[];
} {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length === 0) return { columns: [], rows: [] };

  const splitLine = (line: string) => {
    const cells: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        inQuotes = !inQuotes;
        continue;
      }
      if (ch === "," && !inQuotes) {
        cells.push(current.trim());
        current = "";
        continue;
      }
      current += ch;
    }
    cells.push(current.trim());
    return cells;
  };

  const header = splitLine(lines[0]);
  const columns = header.map((h, i) => h || `Column ${i + 1}`);
  const rows = lines.slice(1).map((line) => {
    const cells = splitLine(line);
    const record: Record<string, string | number> = {};
    columns.forEach((col, i) => {
      record[col] = normalizeCellValue(cells[i]);
    });
    return record;
  });

  return { columns, rows };
}
