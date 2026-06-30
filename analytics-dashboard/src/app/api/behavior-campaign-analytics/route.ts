import { NextRequest, NextResponse } from "next/server";
import { getBehaviorCampaignAnalytics } from "@/data/behavior-campaign-analytics";
import type { CampaignAnalysisPeriod } from "@/types";
import type { WorkspaceId } from "@/data/workspaces";

const PERIODS: CampaignAnalysisPeriod[] = ["monthly", "quarterly", "yearly"];
const WORKSPACES: WorkspaceId[] = ["u9", "u5", "u7", "u8"];

export async function GET(request: NextRequest) {
  const workspaceId = (request.nextUrl.searchParams.get("workspace") ?? "u9") as WorkspaceId;
  const period = (request.nextUrl.searchParams.get("period") ?? "monthly") as CampaignAnalysisPeriod;

  const ws = WORKSPACES.includes(workspaceId) ? workspaceId : "u9";
  const p = PERIODS.includes(period) ? period : "monthly";

  await new Promise((r) => setTimeout(r, 60));
  return NextResponse.json(getBehaviorCampaignAnalytics(ws, p));
}
