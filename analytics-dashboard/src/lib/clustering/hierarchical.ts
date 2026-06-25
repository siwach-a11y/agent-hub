import { euclidean } from "./math";

function buildDistanceMatrix(data: number[][]): number[][] {
  const n = data.length;
  const dist = Array.from({ length: n }, () => Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const d = euclidean(data[i], data[j]);
      dist[i][j] = d;
      dist[j][i] = d;
    }
  }
  return dist;
}

function clusterCompleteLinkage(
  dist: number[][],
  membersA: number[],
  membersB: number[]
): number {
  let max = 0;
  for (const a of membersA) {
    for (const b of membersB) {
      max = Math.max(max, dist[a][b]);
    }
  }
  return max;
}

type ActiveCluster = { members: number[] };

export function hierarchicalClustering(data: number[][], k: number): number[] {
  const n = data.length;
  if (n === 0 || k <= 0) return [];
  const effectiveK = Math.min(k, n);
  const dist = buildDistanceMatrix(data);
  const clusters: ActiveCluster[] = data.map((_, i) => ({ members: [i] }));

  while (clusters.length > effectiveK) {
    let bestI = 0;
    let bestJ = 1;
    let bestDist = Infinity;

    for (let i = 0; i < clusters.length; i++) {
      for (let j = i + 1; j < clusters.length; j++) {
        const d = clusterCompleteLinkage(dist, clusters[i].members, clusters[j].members);
        if (d < bestDist) {
          bestDist = d;
          bestI = i;
          bestJ = j;
        }
      }
    }

    const merged: ActiveCluster = {
      members: [...clusters[bestI].members, ...clusters[bestJ].members],
    };
    clusters.splice(bestJ, 1);
    clusters.splice(bestI, 1);
    clusters.push(merged);
  }

  const labels = Array(n).fill(0);
  clusters.forEach((cluster, clusterId) => {
    for (const member of cluster.members) {
      labels[member] = clusterId;
    }
  });

  return labels;
}
