import { euclidean } from "./math";

function pickInitialCentroids(data: number[][], k: number, seed: number): number[][] {
  const centroids: number[][] = [];
  const used = new Set<number>();
  let s = seed;
  while (centroids.length < k) {
    s = (s * 16807 + 0) % 2147483647;
    const idx = s % data.length;
    if (!used.has(idx)) {
      used.add(idx);
      centroids.push([...data[idx]]);
    }
  }
  return centroids;
}

export function kMeans(
  data: number[][],
  k: number,
  maxIter = 60,
  seed = 42
): { labels: number[]; centroids: number[][] } {
  if (data.length === 0 || k <= 0) {
    return { labels: [], centroids: [] };
  }

  const effectiveK = Math.min(k, data.length);
  const centroids = pickInitialCentroids(data, effectiveK, seed);
  const labels = Array(data.length).fill(0);

  for (let iter = 0; iter < maxIter; iter++) {
    let changed = false;

    for (let i = 0; i < data.length; i++) {
      let best = 0;
      let bestDist = Infinity;
      for (let c = 0; c < effectiveK; c++) {
        const d = euclidean(data[i], centroids[c]);
        if (d < bestDist) {
          bestDist = d;
          best = c;
        }
      }
      if (labels[i] !== best) {
        labels[i] = best;
        changed = true;
      }
    }

    const sums = Array.from({ length: effectiveK }, () =>
      Array(data[0].length).fill(0)
    );
    const counts = Array(effectiveK).fill(0);

    for (let i = 0; i < data.length; i++) {
      const c = labels[i];
      counts[c]++;
      for (let d = 0; d < data[i].length; d++) {
        sums[c][d] += data[i][d];
      }
    }

    for (let c = 0; c < effectiveK; c++) {
      if (counts[c] === 0) continue;
      for (let d = 0; d < sums[c].length; d++) {
        centroids[c][d] = sums[c][d] / counts[c];
      }
    }

    if (!changed) break;
  }

  return { labels, centroids };
}
