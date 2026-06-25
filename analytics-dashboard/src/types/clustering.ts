export type ClusterMethod = "kmeans" | "hierarchical";

export type SegmentationModelId =
  | "behavioral"
  | "archetypes"
  | "intent"
  | "engagement"
  | "ecosystem"
  | "psychographic"
  | "behavioral_seg"
  | "needs"
  | "value"
  | "lifecycle"
  | "occasion";

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
