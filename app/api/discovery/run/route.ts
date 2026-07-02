import { operatorAuthorized, unauthorized } from "@/lib/pipeline/auth";
import { runDiscovery } from "@/lib/pipeline/discovery";
import { store } from "@/lib/pipeline/store";
import { RewardCategory, RewardType } from "@/lib/types";

export const dynamic = "force-dynamic";

const REWARD_TYPES: RewardType[] = [
  "voucher", "daily-deal", "cashback", "promo-code", "loyalty", "bogo", "flash-sale",
];

export async function POST(req: Request) {
  if (!operatorAuthorized(req)) return unauthorized();

  let body: { rewardType?: string; category?: string; country?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const rewardType = body.rewardType as RewardType;
  if (!REWARD_TYPES.includes(rewardType)) {
    return Response.json({ error: "Invalid rewardType" }, { status: 400 });
  }
  const category = (body.category ?? "Food & Dining") as RewardCategory;
  const country = (body.country ?? "US").trim() || "US";

  try {
    const discovered = await runDiscovery({
      rewardType,
      category,
      country,
      now: new Date().toISOString(),
    });
    const result = await store.upsertMany(discovered);
    return Response.json({
      discovered: discovered.length,
      added: result.added,
      skipped: result.skipped,
      offers: result.offers,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Discovery failed";
    return Response.json({ error: message }, { status: 500 });
  }
}
