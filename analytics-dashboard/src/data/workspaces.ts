import { U9 } from "./u9-constants";

export type WorkspaceId = "u9" | "u5" | "u7" | "u8";

export const WORKSPACE_IDS: WorkspaceId[] = ["u9", "u5", "u7", "u8"];

export type WorkspaceMetrics = {
  workspace: {
    id: WorkspaceId;
    code: string;
    name: string;
    country: string;
    flag: string;
    tier: string;
    status: string;
    subscribers: number;
    mrr: number;
    contractEnd: string;
  };
  dau: number;
  mau: number;
  bnryEarned30d: number;
  bnryRedeemed30d: number;
  earnBurnRatio: number;
  netBnryPerUser: number;
  emartTx30d: number;
  stwWinners30d: number;
  earn: {
    video: number;
    quest: number;
    stw: number;
    screenTime: number;
    topup: number;
  };
  burn: {
    accessPass: { volume: number; percent: number };
    emartSpend: { volume: number; percent: number };
  };
  engagement: {
    homepageViewsPerUser: number;
    avgSessionSeconds: number;
    gameClicksPerUser: number;
    stwRewardsPerClick: number;
    repeatSessionMultiplier: number;
    dauMauStickiness: number;
  };
  apiNote: string;
  /** Raw Data page brand (e.g. Okara for Vietnam) */
  rawDataBrand: string;
  /** How many of 28 raw data fields are live for this country */
  rawDataLiveFields: number;
  /** Field IDs not yet exposed for this workspace platform */
  rawDataUnavailableFields?: string[];
};

export const WORKSPACES: Record<WorkspaceId, WorkspaceMetrics> = {
  u9: U9,
  u5: {
    workspace: {
      id: "u5",
      code: "U5",
      name: "U5",
      country: "Indonesia",
      flag: "🇮🇩",
      tier: "Production",
      status: "Active",
      subscribers: 12_000_000,
      mrr: 24_000,
      contractEnd: "Dec 2026",
    },
    dau: 68_400,
    mau: 2_100_000,
    bnryEarned30d: 18_200_000,
    bnryRedeemed30d: 2_410_000,
    earnBurnRatio: 7.55,
    netBnryPerUser: 12.4,
    emartTx30d: 184,
    stwWinners30d: 512_000,
    earn: {
      video: 92_000,
      quest: 1_420_000,
      stw: 14_800_000,
      screenTime: 1_680_000,
      topup: 210_000,
    },
    burn: {
      accessPass: { volume: 2_280_000, percent: 95 },
      emartSpend: { volume: 130_000, percent: 5 },
    },
    engagement: {
      homepageViewsPerUser: 2.1,
      avgSessionSeconds: 48,
      gameClicksPerUser: 0.12,
      stwRewardsPerClick: 76.4,
      repeatSessionMultiplier: 0.11,
      dauMauStickiness: 3.8,
    },
    apiNote:
      "Indonesia production workspace · BNII Analytics API · 28 of 28 fields live.",
    rawDataBrand: "Nusantara",
    rawDataLiveFields: 28,
  },
  u7: {
    workspace: {
      id: "u7",
      code: "U7",
      name: "U7",
      country: "Sri Lanka",
      flag: "🇱🇰",
      tier: "Production",
      status: "Active",
      subscribers: 8_500_000,
      mrr: 18_500,
      contractEnd: "Mar 2027",
    },
    dau: 44_200,
    mau: 1_380_000,
    bnryEarned30d: 11_400_000,
    bnryRedeemed30d: 1_620_000,
    earnBurnRatio: 7.04,
    netBnryPerUser: 11.2,
    emartTx30d: 96,
    stwWinners30d: 318_000,
    earn: {
      video: 58_000,
      quest: 890_000,
      stw: 9_200_000,
      screenTime: 1_120_000,
      topup: 132_000,
    },
    burn: {
      accessPass: { volume: 1_540_000, percent: 95 },
      emartSpend: { volume: 80_000, percent: 5 },
    },
    engagement: {
      homepageViewsPerUser: 1.9,
      avgSessionSeconds: 45,
      gameClicksPerUser: 0.08,
      stwRewardsPerClick: 82.1,
      repeatSessionMultiplier: 0.09,
      dauMauStickiness: 3.5,
    },
    apiNote:
      "Sri Lanka production workspace · BNII Analytics API · 28 of 28 fields live.",
    rawDataBrand: "Lanka",
    rawDataLiveFields: 28,
  },
  u8: {
    workspace: {
      id: "u8",
      code: "U8",
      name: "U8",
      country: "Vietnam",
      flag: "🇻🇳",
      tier: "Pilot",
      status: "Active",
      subscribers: 6_100_000,
      mrr: 0,
      contractEnd: "Sep 2026",
    },
    dau: 31_800,
    mau: 920_000,
    bnryEarned30d: 7_640_000,
    bnryRedeemed30d: 1_020_000,
    earnBurnRatio: 7.49,
    netBnryPerUser: 10.6,
    emartTx30d: 38,
    stwWinners30d: 224_000,
    earn: {
      video: 38_000,
      quest: 598_000,
      stw: 6_280_000,
      screenTime: 648_000,
      topup: 76_000,
    },
    burn: {
      accessPass: { volume: 968_000, percent: 95 },
      emartSpend: { volume: 52_000, percent: 5 },
    },
    engagement: {
      homepageViewsPerUser: 1.85,
      avgSessionSeconds: 41,
      gameClicksPerUser: 0.06,
      stwRewardsPerClick: 79.5,
      repeatSessionMultiplier: 0.08,
      dauMauStickiness: 3.4,
    },
    apiNote:
      "Vietnam pilot workspace · BNII Analytics API · 27 of 28 fields live.",
    rawDataBrand: "Okara",
    rawDataLiveFields: 27,
    rawDataUnavailableFields: ["bnry_earned_topup"],
  },
};

export const WORKSPACE_OPTIONS = (Object.keys(WORKSPACES) as WorkspaceId[]).map((id) => {
  const w = WORKSPACES[id].workspace;
  return {
    id,
    code: w.code,
    country: w.country,
    flag: w.flag,
    label: `${w.flag} ${w.country}`,
    tier: w.tier,
  };
});

export function getWorkspace(id: WorkspaceId): WorkspaceMetrics {
  return WORKSPACES[id];
}

export function getEarnChannels(workspace: WorkspaceMetrics) {
  return [
    {
      id: "telkomsel" as const,
      name: "STW Rewards",
      country: workspace.workspace.country,
      marketShare: 82.6,
      activeWallets: Math.round(workspace.mau * 0.56),
      transactions: workspace.earn.stw,
      growthPercent: 12.4,
      retention: 78.2,
      newUsers: Math.round(workspace.stwWinners30d * 0.25),
      color: "#8b6914",
      logo: "STW",
    },
    {
      id: "indosat" as const,
      name: "Quest",
      country: workspace.workspace.country,
      marketShare: 7.8,
      activeWallets: Math.round(workspace.mau * 0.3),
      transactions: workspace.earn.quest,
      growthPercent: 8.1,
      retention: 71.5,
      newUsers: Math.round(workspace.mau * 0.035),
      color: "#2d6a4f",
      logo: "Q",
    },
    {
      id: "globe" as const,
      name: "Screen Time",
      country: workspace.workspace.country,
      marketShare: 9.2,
      activeWallets: Math.round(workspace.mau * 0.2),
      transactions: workspace.earn.screenTime,
      growthPercent: 5.6,
      retention: 68.4,
      newUsers: Math.round(workspace.mau * 0.024),
      color: "#7c5cbf",
      logo: "SC",
    },
  ];
}

/** @deprecated use getEarnChannels(getWorkspace("u9")) */
export const U9_EARN_CHANNELS = getEarnChannels(U9);
