import { getCustomerAnalytics } from "@/data/customer-analytics";
import { getWorkspace, type WorkspaceId } from "@/data/workspaces";
import {
  hierarchicalClustering,
  kMeans,
  normalizeMatrix,
  project2D,
  silhouetteScore,
  seededRandom,
} from "@/lib/clustering";
import type {
  ClusterMethod,
  ClusterProfile,
  SegmentationClusterResult,
  SegmentationModelDefinition,
  SegmentationModelId,
  WorkspaceClusterAnalytics,
} from "@/types/clustering";

const CLUSTER_COLORS = [
  "#FF6B00",
  "#10B981",
  "#3B82F6",
  "#8B5CF6",
  "#F59E0B",
  "#EF4444",
  "#14B8A6",
  "#EC4899",
];

export const SEGMENTATION_MODELS: SegmentationModelDefinition[] = [
  {
    id: "behavioral",
    label: "Behavioral Clusters",
    description: "Session depth, churn risk, and earn velocity patterns",
    k: 5,
  },
  {
    id: "archetypes",
    label: "Evaluators · Loyalists · Power Users",
    description: "Archetype clusters from engagement and value signals",
    k: 4,
  },
  {
    id: "intent",
    label: "Intent Clusters",
    description: "Acquisition channel and conversion intent",
    k: 4,
  },
  {
    id: "engagement",
    label: "Engagement Clusters",
    description: "Retention, NPS, and repeat-session behavior",
    k: 5,
  },
  {
    id: "ecosystem",
    label: "Ecosystem Clusters",
    description: "Wallet breadth, operator mix, and dApp affinity",
    k: 4,
  },
  {
    id: "psychographic",
    label: "Psychographic Segmentation",
    description: "Attitude and segment affinity profiles",
    k: 4,
  },
  {
    id: "behavioral_seg",
    label: "Behavioral Segmentation",
    description: "Full behavioral feature space clustering",
    k: 5,
  },
  {
    id: "needs",
    label: "Needs-Based Segmentation",
    description: "Spend, tenure, and lifecycle-derived needs",
    k: 4,
  },
  {
    id: "value",
    label: "Value-Based Segmentation",
    description: "LTV and monthly BNRY contribution tiers",
    k: 4,
  },
  {
    id: "lifecycle",
    label: "Lifecycle Segmentation",
    description: "New, active, at-risk, and churn progression",
    k: 4,
  },
  {
    id: "occasion",
    label: "Occasion-Based Segmentation",
    description: "Campaign, payday, and event-driven usage spikes",
    k: 5,
  },
];

type SubscriberRecord = {
  id: string;
  retention: number;
  nps: number;
  churnRisk: number;
  monthlySpend: number;
  ltv: number;
  walletCount: number;
  tenureMonths: number;
  channelIdx: number;
  segmentIdx: number;
  operatorIdx: number;
  lifecycleIdx: number;
  engagementScore: number;
  occasionCampaign: number;
  occasionPayday: number;
  occasionWeekend: number;
};

const CHANNEL_COUNT = 5;
const SEGMENT_COUNT = 4;
const OPERATOR_COUNT = 3;
const LIFECYCLE_COUNT = 4;

function channelIndex(channel: string): number {
  const map: Record<string, number> = {
    carrier: 0,
    organic: 1,
    referral: 2,
    campaign: 3,
    partner: 4,
  };
  return map[channel] ?? 0;
}

function segmentIndex(segment: string): number {
  const map: Record<string, number> = {
    retail: 0,
    premium: 1,
    crypto: 2,
    defi: 3,
  };
  return map[segment] ?? 0;
}

function operatorIndex(operator: string): number {
  const map: Record<string, number> = {
    telkomsel: 0,
    indosat: 1,
    globe: 2,
  };
  return map[operator] ?? 0;
}

function lifecycleIndex(stage: string): number {
  const map: Record<string, number> = {
    new: 0,
    active: 1,
    at_risk: 2,
    churned: 3,
  };
  return map[stage] ?? 1;
}

function generateSubscribers(workspaceId: WorkspaceId, targetCount = 220): SubscriberRecord[] {
  const W = getWorkspace(workspaceId);
  const seed = workspaceId.charCodeAt(0) * 1000 + workspaceId.charCodeAt(1);
  const rand = seededRandom(seed);
  const base = getCustomerAnalytics(workspaceId).customers;
  const records: SubscriberRecord[] = [];

  for (let i = 0; i < targetCount; i++) {
    const template = base[i % base.length];
    const noise = () => 0.75 + rand() * 0.5;

    const retention = Math.min(99, template.retentionScore * noise());
    const nps = Math.min(100, template.nps * noise());
    const churnRisk = Math.min(99, template.churnRisk * (0.85 + rand() * 0.3));
    const monthlySpend = template.monthlySpend * noise() * (W.bnryEarned30d / W.mau / 500);
    const ltv = template.ltv * noise();
    const walletCount = Math.max(1, Math.round(template.walletCount * noise()));
    const tenureMonths = Math.round((i % 24) + rand() * 12);
    const engagementScore =
      (retention * 0.35 + nps * 0.25 + (100 - churnRisk) * 0.25 + walletCount * 8) / 100;

    records.push({
      id: `sub-${workspaceId}-${i}`,
      retention,
      nps,
      churnRisk,
      monthlySpend,
      ltv,
      walletCount,
      tenureMonths,
      channelIdx: channelIndex(template.acquisitionChannel),
      segmentIdx: segmentIndex(template.segment),
      operatorIdx: operatorIndex(template.operator),
      lifecycleIdx: lifecycleIndex(template.lifecycleStage),
      engagementScore,
      occasionCampaign: rand(),
      occasionPayday: rand(),
      occasionWeekend: rand(),
    });
  }

  return records;
}

function featureVector(sub: SubscriberRecord, modelId: SegmentationModelId): number[] {
  switch (modelId) {
    case "behavioral":
      return [sub.retention, sub.churnRisk, sub.monthlySpend, sub.engagementScore];
    case "archetypes":
      return [sub.engagementScore, sub.monthlySpend, sub.retention, sub.walletCount];
    case "intent":
      return [sub.channelIdx / CHANNEL_COUNT, sub.walletCount, sub.lifecycleIdx / LIFECYCLE_COUNT];
    case "engagement":
      return [sub.retention, sub.nps, sub.engagementScore, 100 - sub.churnRisk];
    case "ecosystem":
      return [
        sub.walletCount,
        sub.segmentIdx / SEGMENT_COUNT,
        sub.operatorIdx / OPERATOR_COUNT,
        sub.engagementScore,
      ];
    case "psychographic":
      return [sub.nps, sub.retention, sub.segmentIdx / SEGMENT_COUNT, sub.engagementScore];
    case "behavioral_seg":
      return [
        sub.retention,
        sub.nps,
        sub.churnRisk,
        sub.monthlySpend,
        sub.engagementScore,
        sub.walletCount,
      ];
    case "needs":
      return [sub.monthlySpend, sub.ltv, sub.tenureMonths, sub.lifecycleIdx / LIFECYCLE_COUNT];
    case "value":
      return [sub.ltv, sub.monthlySpend, sub.engagementScore];
    case "lifecycle":
      return [sub.tenureMonths, sub.lifecycleIdx / LIFECYCLE_COUNT, sub.retention, sub.churnRisk];
    case "occasion":
      return [sub.occasionCampaign, sub.occasionPayday, sub.occasionWeekend, sub.monthlySpend];
    default: {
      const _exhaustive: never = modelId;
      return _exhaustive;
    }
  }
}

const ARCHETYPE_LABELS = ["Evaluators", "Loyalists", "Power Users", "Explorers"];

function labelClusters(
  modelId: SegmentationModelId,
  labels: number[],
  subs: SubscriberRecord[],
  centroids: number[][] | undefined,
  k: number
): string[] {
  const clusterStats = Array.from({ length: k }, (_, c) => {
    const members = subs.filter((_, i) => labels[i] === c);
    const avgEng =
      members.reduce((s, m) => s + m.engagementScore, 0) / Math.max(members.length, 1);
    const avgVal =
      members.reduce((s, m) => s + m.monthlySpend, 0) / Math.max(members.length, 1);
    const avgRet =
      members.reduce((s, m) => s + m.retention, 0) / Math.max(members.length, 1);
    return { avgEng, avgVal, avgRet, count: members.length };
  });

  const prefixByModel: Partial<Record<SegmentationModelId, string[]>> = {
    value: ["Whales", "High value", "Mid value", "Low value"],
    engagement: ["Champions", "Engaged", "Passive", "Dormant", "Disengaged"],
    intent: ["High intent", "Researching", "Window shoppers", "Low intent"],
    ecosystem: ["Super-connectors", "Multi-wallet", "Single-app", "Peripheral"],
    psychographic: ["Advocates", "Pragmatists", "Skeptics", "Indifferent"],
    needs: ["Growth seekers", "Stability", "Rewards hunters", "Price sensitive"],
    occasion: ["Campaign responders", "Payday spikes", "Weekend warriors", "Steady", "Event-driven"],
    behavioral: ["High momentum", "Steady actors", "Cooling", "At-risk", "Peripheral"],
    behavioral_seg: ["Power segment", "Core segment", "Emerging", "Niche", "Low activity"],
  };

  function rankAndLabel(rankKey: "score" | "lc", values: { i: number; score?: number; lc?: number }[]) {
    const sorted = [...values].sort((a, b) => {
      const av = rankKey === "score" ? a.score! : a.lc!;
      const bv = rankKey === "score" ? b.score! : b.lc!;
      return bv - av;
    });
    const prefix = prefixByModel[modelId] ?? ["Cluster"];
    const labelMap = new Map<number, string>();
    sorted.forEach((r, rank) => {
      labelMap.set(r.i, prefix[rank] ?? `Cluster ${rank + 1}`);
    });
    return Array.from({ length: k }, (_, i) => labelMap.get(i) ?? `Cluster ${i + 1}`);
  }

  if (modelId === "archetypes") {
    const ranked = clusterStats
      .map((s, i) => ({
        i,
        score: s.avgEng * 0.5 + s.avgVal * 0.3 + s.avgRet * 0.2,
      }))
      .sort((a, b) => b.score - a.score);
    const labelMap = new Map<number, string>();
    ranked.forEach((r, rank) => {
      labelMap.set(r.i, ARCHETYPE_LABELS[rank] ?? `Archetype ${rank + 1}`);
    });
    return Array.from({ length: k }, (_, i) => labelMap.get(i) ?? `Archetype ${i + 1}`);
  }

  if (modelId === "lifecycle") {
    const lifecycleLabels = ["New entrants", "Active core", "At-risk cohort", "Churned / dormant"];
    const byLifecycle = clusterStats
      .map((s, i) => ({
        i,
        lc:
          subs.filter((_, idx) => labels[idx] === i).reduce((a, m) => a + m.lifecycleIdx, 0) /
          Math.max(s.count, 1),
      }))
      .sort((a, b) => a.lc - b.lc);
    const labelMap = new Map<number, string>();
    byLifecycle.forEach((r, rank) => {
      labelMap.set(r.i, lifecycleLabels[rank] ?? `Lifecycle ${rank + 1}`);
    });
    return Array.from({ length: k }, (_, i) => labelMap.get(i) ?? `Lifecycle ${i + 1}`);
  }

  if (centroids && centroids.length === k) {
    return rankAndLabel(
      "score",
      centroids.map((c, i) => ({
        i,
        score: c.reduce((a, b) => a + b, 0) / c.length,
      }))
    );
  }

  return rankAndLabel(
    "score",
    clusterStats.map((s, i) => ({
      i,
      score: s.avgEng * 0.4 + s.avgVal * 0.3 + s.avgRet * 0.3,
    }))
  );
}

function traitsForCluster(
  modelId: SegmentationModelId,
  label: string,
  avgEng: number,
  avgVal: number,
  avgRet: number
): string[] {
  const traits: string[] = [];
  if (avgRet >= 80) traits.push("High retention");
  if (avgEng >= 0.7) traits.push("Strong engagement");
  if (avgVal >= 500) traits.push("High BNRY velocity");
  if (modelId === "archetypes") traits.push(`${label} archetype`);
  if (modelId === "value" && label.includes("Whale")) traits.push("Top LTV tier");
  if (traits.length === 0) traits.push("Distinct behavioral signature");
  return traits.slice(0, 3);
}

function runSegmentation(
  model: SegmentationModelDefinition,
  method: ClusterMethod,
  subs: SubscriberRecord[]
): SegmentationClusterResult {
  const rawMatrix = subs.map((s) => featureVector(s, model.id));
  const normalized = normalizeMatrix(rawMatrix);
  const projected = project2D(normalized);

  let labels: number[];
  let centroids: number[][] | undefined;

  if (method === "kmeans") {
    const result = kMeans(normalized, model.k, 60, model.id.charCodeAt(0));
    labels = result.labels;
    centroids = result.centroids;
  } else {
    labels = hierarchicalClustering(normalized, model.k);
  }

  const clusterLabels = labelClusters(model.id, labels, subs, centroids, model.k);
  const silhouette = silhouetteScore(normalized, labels);
  const total = subs.length;

  const profiles: ClusterProfile[] = Array.from({ length: model.k }, (_, c) => {
    const members = subs.filter((_, i) => labels[i] === c);
    const count = members.length;
    const avgEng =
      members.reduce((s, m) => s + m.engagementScore, 0) / Math.max(count, 1);
    const avgVal =
      members.reduce((s, m) => s + m.monthlySpend, 0) / Math.max(count, 1);
    const avgRet =
      members.reduce((s, m) => s + m.retention, 0) / Math.max(count, 1);
    const label = clusterLabels[c] ?? `Cluster ${c + 1}`;

    return {
      clusterId: c,
      label,
      count,
      share: (count / total) * 100,
      color: CLUSTER_COLORS[c % CLUSTER_COLORS.length],
      traits: traitsForCluster(model.id, label, avgEng, avgVal, avgRet),
      avgEngagement: avgEng,
      avgValue: avgVal,
    };
  });

  const assignments = subs.map((sub, i) => ({
    id: sub.id,
    x: projected[i].x,
    y: projected[i].y,
    clusterId: labels[i],
    clusterLabel: clusterLabels[labels[i]] ?? `Cluster ${labels[i] + 1}`,
  }));

  return {
    modelId: model.id,
    modelLabel: model.label,
    method,
    k: model.k,
    silhouette,
    assignments,
    profiles,
  };
}

export function getWorkspaceClusterAnalytics(
  workspaceId: WorkspaceId = "u9"
): WorkspaceClusterAnalytics {
  const subs = generateSubscribers(workspaceId);
  const featureDimensions = [
    "retention",
    "nps",
    "churnRisk",
    "monthlySpend",
    "ltv",
    "walletCount",
    "engagement",
  ];

  const kmeans = SEGMENTATION_MODELS.map((model) =>
    runSegmentation(model, "kmeans", subs)
  );
  const hierarchical = SEGMENTATION_MODELS.map((model) =>
    runSegmentation(model, "hierarchical", subs)
  );

  return {
    workspaceId,
    subscriberCount: subs.length,
    featureDimensions,
    kmeans,
    hierarchical,
  };
}

export function getSegmentationResult(
  workspaceId: WorkspaceId,
  modelId: SegmentationModelId,
  method: ClusterMethod
): SegmentationClusterResult {
  const analytics = getWorkspaceClusterAnalytics(workspaceId);
  const list = method === "kmeans" ? analytics.kmeans : analytics.hierarchical;
  const found = list.find((r) => r.modelId === modelId);
  if (!found) {
    throw new Error(`Segmentation model not found: ${modelId}`);
  }
  return found;
}
