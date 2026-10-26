import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { userProfiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { buildUserProfileVector, ensureUserProfilesTable } from "@/lib/ai/recommendations";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const reqHeaders = await headers();
    const session = await auth.api.getSession({
      headers: reqHeaders,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await ensureUserProfilesTable();

    const profile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, session.user.id),
    });

    return NextResponse.json({
      preferredCategories: profile?.preferredCategories || ["ceramics-tableware"],
      styleAffinities: profile?.styleAffinities || ["wabi-sabi", "minimalist"],
      tasteNotes: profile?.tasteNotes || "",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load preferences";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const reqHeaders = await headers();
    const session = await auth.api.getSession({
      headers: reqHeaders,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await ensureUserProfilesTable();

    const body = await req.json().catch(() => ({}));
    const preferredCategories: string[] = Array.isArray(body.preferredCategories)
      ? body.preferredCategories
      : ["ceramics-tableware"];
    const styleAffinities: string[] = Array.isArray(body.styleAffinities)
      ? body.styleAffinities
      : ["wabi-sabi"];
    const tasteNotes: string = typeof body.tasteNotes === "string" ? body.tasteNotes : "";

    // 1. Check if profile exists
    const existing = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, session.user.id),
    });

    if (existing) {
      await db
        .update(userProfiles)
        .set({
          preferredCategories,
          styleAffinities,
          tasteNotes,
          updatedAt: new Date(),
        })
        .where(eq(userProfiles.id, existing.id));
    } else {
      await db.insert(userProfiles).values({
        userId: session.user.id,
        preferredCategories,
        styleAffinities,
        tasteNotes,
      });
    }

    // 2. Re-index vector embedding with new profile data
    await buildUserProfileVector(session.user.id);

    return NextResponse.json({
      success: true,
      message: "Taste profile updated and AI vector index refreshed.",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update taste preferences";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
