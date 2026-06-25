export function euclidean(a: number[], b: number[]): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    const d = a[i] - b[i];
    sum += d * d;
  }
  return Math.sqrt(sum);
}

export function normalizeMatrix(matrix: number[][]): number[][] {
  const dims = matrix[0]?.length ?? 0;
  const mins = Array(dims).fill(Infinity);
  const maxs = Array(dims).fill(-Infinity);

  for (const row of matrix) {
    for (let d = 0; d < dims; d++) {
      mins[d] = Math.min(mins[d], row[d]);
      maxs[d] = Math.max(maxs[d], row[d]);
    }
  }

  return matrix.map((row) =>
    row.map((v, d) => {
      const span = maxs[d] - mins[d];
      return span === 0 ? 0 : (v - mins[d]) / span;
    })
  );
}

/** 2D projection via first two normalized dimensions with slight jitter for visibility */
export function project2D(normalized: number[][]): { x: number; y: number }[] {
  return normalized.map((row, i) => ({
    x: row[0] + (i % 7) * 0.002,
    y: (row[1] ?? row[0]) + (i % 5) * 0.002,
  }));
}

export function silhouetteScore(data: number[][], labels: number[]): number {
  const k = new Set(labels).size;
  if (k < 2 || data.length < k + 1) return 0;

  const scores: number[] = [];

  for (let i = 0; i < data.length; i++) {
    const cluster = labels[i];
    const same = data.filter((_, j) => labels[j] === cluster && j !== i);
    const a =
      same.length === 0
        ? 0
        : same.reduce((s, p) => s + euclidean(data[i], p), 0) / same.length;

    let b = Infinity;
    for (let c = 0; c < k; c++) {
      if (c === cluster) continue;
      const other = data.filter((_, j) => labels[j] === c);
      if (other.length === 0) continue;
      const dist =
        other.reduce((s, p) => s + euclidean(data[i], p), 0) / other.length;
      b = Math.min(b, dist);
    }

    if (b === Infinity) continue;
    const s = (b - a) / Math.max(a, b);
    scores.push(s);
  }

  return scores.length === 0
    ? 0
    : scores.reduce((x, y) => x + y, 0) / scores.length;
}

export function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}
