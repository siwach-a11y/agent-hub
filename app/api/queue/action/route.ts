import { operatorAuthorized, unauthorized } from "@/lib/pipeline/auth";
import { store } from "@/lib/pipeline/store";
import { PipelineStatus } from "@/lib/pipeline/types";

export const dynamic = "force-dynamic";

type Action = "approve" | "reject" | "publish";

const NEXT_STATUS: Record<Action, PipelineStatus> = {
  approve: "approved",
  reject: "rejected",
  publish: "published",
};

export async function POST(req: Request) {
  if (!operatorAuthorized(req)) return unauthorized();

  let body: { id?: string; action?: Action };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { id, action } = body;
  if (!id || !action || !(action in NEXT_STATUS)) {
    return Response.json({ error: "id and valid action required" }, { status: 400 });
  }

  const now = new Date().toISOString();
  const patch =
    action === "approve"
      ? { approvedAt: now }
      : action === "publish"
        ? { publishedAt: now }
        : {};

  const updated = await store.updateStatus(id, NEXT_STATUS[action], patch);
  if (!updated) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json({ offer: updated });
}
