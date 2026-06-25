import { NextResponse } from "next/server";
import { API_PLUGIN_DEFINITIONS } from "@/lib/api-plugin/registry";

export async function GET() {
  return NextResponse.json({
    plugins: API_PLUGIN_DEFINITIONS,
    version: "1.0.0",
  });
}
