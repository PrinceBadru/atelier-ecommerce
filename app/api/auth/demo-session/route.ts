import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, sessions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const targetRole = body.role === "admin" ? "admin" : "shopper";
    const targetEmail = targetRole === "admin" ? "admin@atelier.dev" : "demo@atelier.dev";
    const targetName = targetRole === "admin" ? "Admin Demo" : "Shopper Demo";

    // 1. Find or create demo user
    let user = await db.query.users.findFirst({
      where: eq(users.email, targetEmail),
    });

    if (!user) {
      const [created] = await db
        .insert(users)
        .values({
          email: targetEmail,
          name: targetName,
          role: targetRole,
          emailVerified: true,
        })
        .returning();
      user = created;
    } else if (user.role !== targetRole) {
      const [updated] = await db
        .update(users)
        .set({ role: targetRole })
        .where(eq(users.id, user.id))
        .returning();
      user = updated;
    }

    // 2. Generate cryptographically strong session token
    const token = crypto.randomBytes(32).toString("hex");
    const sessionId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await db.insert(sessions).values({
      id: sessionId,
      userId: user.id,
      token,
      expiresAt,
    });

    // 3. Set Better Auth session cookie
    const isProd = process.env.NODE_ENV === "production";
    const cookieOptions = {
      path: "/",
      httpOnly: true,
      sameSite: "lax" as const,
      secure: isProd,
      expires: expiresAt,
    };

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });

    response.cookies.set("better-auth.session_token", token, cookieOptions);
    if (isProd) {
      response.cookies.set("__Secure-better-auth.session_token", token, cookieOptions);
    }

    return response;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create demo session";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
