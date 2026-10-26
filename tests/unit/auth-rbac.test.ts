import { describe, it, expect } from "vitest";
import { authClient } from "@/lib/auth/client";
import { middleware } from "@/middleware";
import { NextRequest } from "next/server";

describe("Auth Client & RBAC Security Verification", () => {
  it("exports standard Better Auth client methods", () => {
    expect(authClient).toBeDefined();
    expect(authClient.signIn).toBeDefined();
    expect(authClient.signUp).toBeDefined();
    expect(authClient.signOut).toBeDefined();
    expect(typeof authClient.signIn.email).toBe("function");
    expect(typeof authClient.signUp.email).toBe("function");
    expect(typeof authClient.signOut).toBe("function");
  });

  it("redirects unauthenticated requests from /admin to /admin/login", () => {
    const req = new NextRequest("http://localhost:3000/admin");
    const res = middleware(req);
    expect(res.status).toBe(307);
    const location = res.headers.get("location");
    expect(location).toContain("/admin/login");
    expect(location).toContain("callbackUrl=%2Fadmin");
  });

  it("permits unauthenticated requests to /admin/login without redirection loop", () => {
    const req = new NextRequest("http://localhost:3000/admin/login");
    const res = middleware(req);
    // When middleware passes through, it returns NextResponse.next() (status 200)
    expect(res.status).toBe(200);
  });

  it("redirects unauthenticated requests from /account to /login", () => {
    const req = new NextRequest("http://localhost:3000/account");
    const res = middleware(req);
    expect(res.status).toBe(307);
    const location = res.headers.get("location");
    expect(location).toContain("/login");
    expect(location).toContain("callbackUrl=%2Faccount");
  });

  it("blocks unauthenticated API requests to /api/admin with 401 status", () => {
    const req = new NextRequest("http://localhost:3000/api/admin/products");
    const res = middleware(req);
    expect(res.status).toBe(401);
  });
});
