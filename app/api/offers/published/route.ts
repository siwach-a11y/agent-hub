import { store } from "@/lib/pipeline/store";

export const dynamic = "force-dynamic";

/** Public: approved+published offers for the marketplace to surface. */
export async function GET() {
  const offers = await store.list({ status: "published" });
  return Response.json({ offers });
}
