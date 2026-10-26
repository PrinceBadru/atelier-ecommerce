import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, sessions, accounts } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import crypto from "crypto";

const SOCIAL_PROFILES: Record<string, { email: string; name: string; image: string }> = {
  google: {
    email: "alex.google@atelier.studio",
    name: "Alex Vance (Google)",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80",
  },
  github: {
    email: "dev.github@atelier.studio",
    name: "Octo Craftsman (GitHub)",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80",
  },
  microsoft: {
    email: "patron.msft@atelier.studio",
    name: "Morgan Lee (Microsoft)",
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=160&q=80",
  },
  apple: {
    email: "patron.apple@privaterelay.appleid.com",
    name: "Julian Croft (Apple)",
    image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=160&q=80",
  },
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const provider = body.provider as string | undefined;

    const targetRole: "shopper" | "admin" = body.role === "admin" ? "admin" : "shopper";
    let targetEmail = targetRole === "admin" ? "admin@atelier.dev" : "demo@atelier.dev";
    let targetName = targetRole === "admin" ? "Admin Demo" : "Shopper Demo";
    let targetImage: string | null = null;

    if (provider && SOCIAL_PROFILES[provider.toLowerCase()]) {
      const p = SOCIAL_PROFILES[provider.toLowerCase()];
      targetEmail = p.email;
      targetName = p.name;
      targetImage = p.image;
    }

    // 1. Find or create user
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
          image: targetImage,
          emailVerified: true,
        })
        .returning();
      user = created;
    } else {
      const updateData: Partial<typeof users.$inferInsert> = {};
      if (user.role !== targetRole) updateData.role = targetRole;
      if (targetImage && !user.image) updateData.image = targetImage;
      if (Object.keys(updateData).length > 0) {
        const [updated] = await db
          .update(users)
          .set(updateData)
          .where(eq(users.id, user.id))
          .returning();
        user = updated;
      }
    }

    // 2. Link social account in accounts table if provider given
    if (provider) {
      const existingAccount = await db.query.accounts.findFirst({
        where: and(eq(accounts.userId, user.id), eq(accounts.providerId, provider)),
      });

      if (!existingAccount) {
        await db.insert(accounts).values({
          userId: user.id,
          providerId: provider,
          accountId: `${provider}_${user.id.slice(0, 8)}`,
        });
      }
    }

    // 3. Generate cryptographically strong session token
    const token = crypto.randomBytes(32).toString("hex");
    const sessionId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await db.insert(sessions).values({
      id: sessionId,
      userId: user.id,
      token,
      expiresAt,
    });

    // 4. Set Better Auth HMAC-signed session cookie
    const isProd = process.env.NODE_ENV === "production";
    const cookieOptions = {
      path: "/",
      httpOnly: true,
      sameSite: "lax" as const,
      secure: isProd,
      expires: expiresAt,
    };

    const secret =
      process.env.BETTER_AUTH_SECRET ||
      "atelier_demo_better_auth_secret_minimum_32_characters_long";
    const signature = crypto.createHmac("sha256", secret).update(token).digest("base64");
    const signedValue = `${token}.${signature}`;

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        image: user.image,
      },
    });

    response.cookies.set("better-auth.session_token", signedValue, cookieOptions);
    if (isProd) {
      response.cookies.set("__Secure-better-auth.session_token", signedValue, cookieOptions);
    }

    return response;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create direct session";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
