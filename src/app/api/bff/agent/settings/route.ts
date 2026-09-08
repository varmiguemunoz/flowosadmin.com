import type { NextRequest } from "next/server";

import { apiProxy } from "@/lib/api-server";

/** Agent tuning settings (retrieval top-k, thresholds, model names, toggles). */
export async function GET() {
  return apiProxy({ path: "/agent/settings" });
}

/** Upsert a single setting. `value` is JSON, so it may be a number or boolean. */
export async function PUT(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as unknown;

  if (!body || typeof body !== "object") {
    return Response.json({ message: "Expected a JSON body." }, { status: 400 });
  }

  return apiProxy({ path: "/agent/settings", method: "PUT", body });
}
