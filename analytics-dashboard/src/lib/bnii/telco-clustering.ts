/**
 * Telco-level clustering on REAL BNII raw data.
 *
 * Unlike the retired synthetic subscriber clustering, this engine runs the same
 * real K-Means / hierarchical algorithms over the nine BNII telco partners as
 * the observations — each point is one telco, each feature is a real aggregate
 * raw-data field (value30d) from the BNII Analytics API. No fabricated rows.
 *
 * Integrity: a telco missing a feature has that feature imputed with the column
 * mean and is flagged `complete: false`; a telco with no features at all is
 * excluded. Provenance (`api` vs `demo`) is carried through from the raw-data
 * snapshot so the UI never styles a demo fallback as live.
 */
import {
  hierarchicalClustering,
  kMeans,
  normalizeMatrix,
  project2D,
  silhouetteScore,
} from "@/lib/clustering";
import { RAW_DATA_FIELDS } from "@/lib/bnii/raw-data-fields";
import type {
  ClusterMethod,
  TelcoClusterAnalytics,
  TelcoClusterModelDefinition,
  TelcoClusterPoint,
  TelcoClusterProfile,
  TelcoSegmentationResult,
} from "@/types/clustering";
import type { RawDataPlatformSnapshot, RawDataSummary } from "@/types/bnii-raw-data";

const CLUSTER_COLORS = ["#FF6B00", "#10B981", "#3B82F6", "#8B5CF6", "#F59E0B"];

export const TELCO_CLUSTER_MODELS: TelcoClusterModelDefinition[] = [
  {
    id: "engagement_scale",
    label: "Engagement & Scale",
    description:
      "Audience size and stickiness — DAU, 30-day MAU, avg session time, and homepage views.",
    fieldIds: ["unique_users", "mau_d30", "avg_session_sec", "total_homepage_views"],
    primaryFieldId: "mau_d30",
    k: 3,
  },
  {
    id: "token_economy",
    label: "Token Economy",
    description:
      "BNRY flow and activity — total earned, total spent, net BNRY, and total transactions.",
    fieldIds: ["bnry_earned_total", "bnry_spent_total", "bnry_net", "total_transactions"],
    primaryFieldId: "bnry_earned_total",
    k: 3,
  },
  {
    id: "earn_mix",
    label: "Earn-Channel Mix",
    description:
      "Where BNRY comes from — STW, screen-time, quest, and video earn channels.",
    fieldIds: [
      "bnry_earned_stw",
      "bnry_earned_screentime",
      "bnry_earned_quest",
      "bnry_earned_from_video",
    ],
    primaryFieldId: "bnry_earned_stw",
    k: 3,
  },
];

const FIELD_LABELS: Record<string, string> = Object.fromEntries(
  RAW_DATA_FIELDS.map((f) => [f.id, f.label])
);

function fieldLabel(id: string): string {
  return FIELD_LABELS[id] ?? id;
}

type TelcoFeatureRow = {
  id: string;
  code: string;
  name: string;
  country: string;
  /** Per-field value (null = not available for this telco). */
  values: (number | null)[];
};

function rawValue(summary: RawDataSummary, fieldId: string): number | null {
  const row = summary.rows.find((r) => r.fieldId === fieldId);
  return row?.value30d ?? null;
}

/** Build telco rows for a model, keeping only telcos with ≥1 available feature. */
function buildFeatureRows(
  countries: RawDataSummary[],
  fieldIds: string[]
): { rows: TelcoFeatureRow[]; excluded: string[] } {
  const rows: TelcoFeatureRow[] = [];
  const excluded: string[] = [];

  for (const c of countries) {
    const values = fieldIds.map((fid) => rawValue(c, fid));
    if (values.every((v) => v === null)) {
      excluded.push(c.code);
      continue;
    }
    rows.push({
      id: c.workspaceId,
      code: c.code,
      name: c.telcoName ?? c.brandLabel,
      country: c.country,
      values,
    });
  }

  return { rows, excluded };
}

/** Impute null features with the column mean; returns the dense matrix. */
function imputeMatrix(rows: TelcoFeatureRow[], dims: number): number[][] {
  const means = Array(dims).fill(0);
  const counts = Array(dims).fill(0);
  for (const row of rows) {
    row.values.forEach((v, d) => {
      if (v !== null) {
        means[d] += v;
        counts[d] += 1;
      }
    });
  }
  for (let d = 0; d < dims; d++) {
    means[d] = counts[d] > 0 ? means[d] / counts[d] : 0;
  }
  return rows.map((row) => row.values.map((v, d) => (v === null ? means[d] : v)));
}

const TIER_LABELS_BY_K: Record<number, string[]> = {
  2: ["Leaders", "Emerging"],
  3: ["Leaders", "Established", "Emerging"],
  4: ["Leaders", "Established", "Developing", "Emerging"],
  5: ["Leaders", "Strong", "Established", "Developing", "Emerging"],
};

/** Rank clusters by mean normalized magnitude → tier labels (high → low). */
function labelClusters(normalized: number[][], labels: number[], k: number): string[] {
  const mag = Array.from({ length: k }, (_, c) => {
    const members = normalized.filter((_, i) => labels[i] === c);
    if (members.length === 0) return { c, score: -1 };
    const score =
      members.reduce((s, row) => s + row.reduce((a, b) => a + b, 0) / row.length, 0) /
      members.length;
    return { c, score };
  });
  const tiers = TIER_LABELS_BY_K[k] ?? Array.from({ length: k }, (_, i) => `Tier ${i + 1}`);
  const ordered = [...mag].sort((a, b) => b.score - a.score);
  const labelByCluster = new Map<number, string>();
  ordered.forEach((entry, rank) => {
    labelByCluster.set(entry.c, tiers[rank] ?? `Tier ${rank + 1}`);
  });
  return Array.from({ length: k }, (_, c) => labelByCluster.get(c) ?? `Tier ${c + 1}`);
}

function runModel(
  model: TelcoClusterModelDefinition,
  method: ClusterMethod,
  countries: RawDataSummary[]
): TelcoSegmentationResult {
  const { rows, excluded } = buildFeatureRows(countries, model.fieldIds);
  const featureFields = model.fieldIds.map((id) => ({ id, label: fieldLabel(id) }));
  const primaryIdx = model.fieldIds.indexOf(model.primaryFieldId);
  const k = Math.min(model.k, Math.max(rows.length, 1));

  const base = {
    modelId: model.id,
    modelLabel: model.label,
    method,
    k,
    primaryFieldLabel: fieldLabel(model.primaryFieldId),
    featureFields,
    telcoCount: rows.length,
    excluded,
  };

  if (rows.length === 0) {
    return { ...base, silhouette: 0, assignments: [], profiles: [] };
  }

  const matrix = imputeMatrix(rows, model.fieldIds.length);
  const normalized = normalizeMatrix(matrix);
  const projected = project2D(normalized);

  const labels =
    method === "kmeans"
      ? kMeans(normalized, k, 80, model.id.charCodeAt(0) + model.id.length).labels
      : hierarchicalClustering(normalized, k);

  const clusterLabels = labelClusters(normalized, labels, k);
  const silhouette = silhouetteScore(normalized, labels);

  const assignments: TelcoClusterPoint[] = rows.map((row, i) => ({
    id: row.id,
    code: row.code,
    name: row.name,
    country: row.country,
    x: projected[i].x,
    y: projected[i].y,
    clusterId: labels[i],
    clusterLabel: clusterLabels[labels[i]] ?? `Tier ${labels[i] + 1}`,
    complete: row.values.every((v) => v !== null),
  }));

  const profiles: TelcoClusterProfile[] = Array.from({ length: k }, (_, c) => {
    const memberRows = rows.filter((_, i) => labels[i] === c);
    const primaryValues =
      primaryIdx >= 0
        ? memberRows.map((r) => r.values[primaryIdx]).filter((v): v is number => v !== null)
        : [];
    const avgPrimary =
      primaryValues.length > 0
        ? primaryValues.reduce((s, v) => s + v, 0) / primaryValues.length
        : 0;
    return {
      clusterId: c,
      label: clusterLabels[c] ?? `Tier ${c + 1}`,
      count: memberRows.length,
      share: (memberRows.length / rows.length) * 100,
      color: CLUSTER_COLORS[c % CLUSTER_COLORS.length],
      members: memberRows.map((r) => r.code),
      avgPrimary,
    };
  });

  return { ...base, silhouette, assignments, profiles };
}

function deriveSource(countries: RawDataSummary[]): TelcoClusterAnalytics["source"] {
  if (countries.length === 0) return "none";
  const sources = new Set(countries.map((c) => c.source));
  if (sources.size === 1) return sources.has("api") ? "api" : "demo";
  return "mixed";
}

/** Cluster the BNII telco partners from a raw-data platform snapshot. */
export function getTelcoClusterAnalytics(
  snapshot: RawDataPlatformSnapshot
): TelcoClusterAnalytics {
  const countries = snapshot.bnii.countries;
  const kmeans = TELCO_CLUSTER_MODELS.map((m) => runModel(m, "kmeans", countries));
  const hierarchical = TELCO_CLUSTER_MODELS.map((m) => runModel(m, "hierarchical", countries));

  return {
    source: deriveSource(countries),
    telcoCount: countries.length,
    dateFrom: countries[0]?.dateFrom ?? null,
    dateTo: countries[0]?.dateTo ?? null,
    models: TELCO_CLUSTER_MODELS,
    kmeans,
    hierarchical,
  };
}
