import type { NextRequest } from "next/server";

import { apiProxy } from "@/lib/api-server";

/** Active agent prompts (one per key). */
export async function GET() {
  return apiProxy({ path: "/agent/prompts" });
}

/**
 * Upsert a prompt. The API creates a new active version and deactivates the
 * previous one, so edits are reversible rather than destructive.
 */
export async function PUT(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as unknown;

  if (!body || typeof body !== "object") {
    return Response.json({ message: "Expected a JSON body." }, { status: 400 });
  }

  return apiProxy({ path: "/agent/prompts", method: "PUT", body });
}
