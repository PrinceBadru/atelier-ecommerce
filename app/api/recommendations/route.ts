import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getPersonalizedRecommendations } from "@/lib/ai/recommendations";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const reqHeaders = await headers();
    const session = await auth.api.getSession({
      headers: reqHeaders,
    });

    const recommendations = await getPersonalizedRecommendations({
      userId: session?.user?.id,
      limit: 6,
    });

    return NextResponse.json(recommendations);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load recommendations";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
