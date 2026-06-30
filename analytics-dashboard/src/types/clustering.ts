export type ClusterMethod = "kmeans" | "hierarchical";

export type SegmentationModelId =
  | "behavioral_clustering"
  | "value"
  | "lifecycle"
  | "occasion"
  | "channel"
  | "engagement"
  | "cohort"
  | "network"
  | "latent_class";

export type SegmentationModelDefinition = {
  id: SegmentationModelId;
  label: string;
  description: string;
  k: number;
};

export type ClusterAssignment = {
  id: string;
  x: number;
  y: number;
  clusterId: number;
  clusterLabel: string;
};

export type ClusterProfile = {
  clusterId: number;
  label: string;
  count: number;
  share: number;
  color: string;
  traits: string[];
  avgEngagement: number;
  avgValue: number;
};

export type SegmentationClusterResult = {
  modelId: SegmentationModelId;
  modelLabel: string;
  method: ClusterMethod;
  k: number;
  silhouette: number;
  assignments: ClusterAssignment[];
  profiles: ClusterProfile[];
};

export type WorkspaceClusterAnalytics = {
  workspaceId: string;
  subscriberCount: number;
  featureDimensions: string[];
  kmeans: SegmentationClusterResult[];
  hierarchical: SegmentationClusterResult[];
};

// ── Telco-level clustering on real BNII raw data ──────────────────────────────
// Clusters the BNII telco partners against each other on their real aggregate
// raw-data fields (no synthetic per-subscriber data). Each point is one telco.

export type TelcoClusterModelId = "engagement_scale" | "token_economy" | "earn_mix";

export type TelcoClusterModelDefinition = {
  id: TelcoClusterModelId;
  label: string;
  description: string;
  /** Real RAW_DATA_FIELDS ids used as clustering features. */
  fieldIds: string[];
  /** Field id whose raw value is the headline metric on profile cards. */
  primaryFieldId: string;
  k: number;
};

/** One clustered telco point (id = workspace slug). */
export type TelcoClusterPoint = {
  id: string;
  code: string;
  name: string;
  country: string;
  x: number;
  y: number;
  clusterId: number;
  clusterLabel: string;
  /** Whether every feature for this telco came from live BNII (no imputation). */
  complete: boolean;
};

export type TelcoClusterProfile = {
  clusterId: number;
  label: string;
  count: number;
  share: number;
  color: string;
  /** Telco codes in this cluster. */
  members: string[];
  /** Average of the model's primary field across cluster members. */
  avgPrimary: number;
};

export type TelcoSegmentationResult = {
  modelId: TelcoClusterModelId;
  modelLabel: string;
  method: ClusterMethod;
  k: number;
  silhouette: number;
  primaryFieldLabel: string;
  featureFields: { id: string; label: string }[];
  assignments: TelcoClusterPoint[];
  profiles: TelcoClusterProfile[];
  telcoCount: number;
  /** Telcos dropped because none of the model's features were available. */
  excluded: string[];
};

export type TelcoClusterAnalytics = {
  /** Provenance across the clustered telcos. */
  source: "api" | "demo" | "mixed" | "none";
  telcoCount: number;
  dateFrom: string | null;
  dateTo: string | null;
  models: TelcoClusterModelDefinition[];
  kmeans: TelcoSegmentationResult[];
  hierarchical: TelcoSegmentationResult[];
};
