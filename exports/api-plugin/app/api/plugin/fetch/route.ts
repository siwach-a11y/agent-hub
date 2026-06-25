import { NextResponse } from "next/server";
import { runApiPlugin, type ApiPluginFetchRequest } from "@/lib/api-plugin";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ApiPluginFetchRequest;
    await new Promise((r) => setTimeout(r, 60));
    const result = await runApiPlugin(body);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Plugin fetch failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
