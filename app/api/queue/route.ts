import { operatorAuthorized, unauthorized } from "@/lib/pipeline/auth";
import { store } from "@/lib/pipeline/store";
import { PipelineStatus, QueueFilter } from "@/lib/pipeline/types";
import { RewardCategory, RewardType } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!operatorAuthorized(req)) return unauthorized();

  const url = new URL(req.url);
  const filter: QueueFilter = {};
  const status = url.searchParams.get("status");
  const country = url.searchParams.get("country");
  const category = url.searchParams.get("category");
  const rewardType = url.searchParams.get("rewardType");
  if (status) filter.status = status as PipelineStatus;
  if (country) filter.country = country;
  if (category) filter.category = category as RewardCategory;
  if (rewardType) filter.rewardType = rewardType as RewardType;

  const offers = await store.list(filter);
  const all = await store.list();
  const counts = all.reduce<Record<string, number>>((acc, o) => {
    acc[o.status] = (acc[o.status] ?? 0) + 1;
    return acc;
  }, {});

  return Response.json({ offers, counts, total: all.length });
}
