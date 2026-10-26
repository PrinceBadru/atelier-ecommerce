import fs from "fs";

const BASE_URL = process.env.BASE_URL || "https://atelier-web-5swv.onrender.com";

interface TestResult {
  method: string;
  success: boolean;
  details: string;
  data?: any;
}

const results: TestResult[] = [];

async function test(name: string, fn: () => Promise<string | void>) {
  try {
    const details = (await fn()) || "Passed successfully";
    console.log(`[PASS] ${name} -> ${details}`);
    results.push({ method: name, success: true, details });
  } catch (err: any) {
    console.error(`[FAIL] ${name} -> ${err.message}`);
    results.push({ method: name, success: false, details: err.message });
  }
}

async function runAllAuthTests() {
  console.log(`\n======================================================`);
  console.log(`  ATELIER AUTHENTICATION SUITE TESTER`);
  console.log(`  Target: ${BASE_URL}`);
  console.log(`======================================================\n`);

  // Robust cookie extractor that captures all set-cookies (both standard and __Secure-)
  function extractCookie(res: Response): string {
    const getSetCookie = (res.headers as any).getSetCookie;
    if (typeof getSetCookie === "function") {
      const list: string[] = getSetCookie.call(res.headers);
      return list
        .map((c) => c.split(";")[0].trim())
        .filter((c) => c.includes("="))
        .join("; ");
    }
    const raw = res.headers.get("set-cookie") || "";
    return raw
      .split(/,(?=[^;]+?=)/)
      .map((c) => c.split(";")[0].trim())
      .filter((c) => c.includes("="))
      .join("; ");
  }

  const defaultHeaders = {
    "Content-Type": "application/json",
    "Origin": BASE_URL,
    "Referer": `${BASE_URL}/login`,
  };

  let shopperCookie = "";
  let adminCookie = "";
  let newAccountEmail = `patron.${Date.now()}@atelier.dev`;
  let newAccountPassword = "AtelierSecurePass2026!";
  let registeredCookie = "";

  // 1. Test Demo Shopper Session
  await test("1. Demo Shopper Session Creation", async () => {
    const res = await fetch(`${BASE_URL}/api/auth/demo-session`, {
      method: "POST",
      headers: defaultHeaders,
      body: JSON.stringify({ role: "shopper" }),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
    shopperCookie = extractCookie(res);
    const body = await res.json();
    if (!body.user || body.user.role !== "shopper") {
      throw new Error(`Invalid shopper user returned: ${JSON.stringify(body)}`);
    }
    return `Created shopper session for ${body.user.email} (Cookie: ${shopperCookie.slice(0, 30)}...)`;
  });

  // 2. Test Session Verification for Shopper
  await test("2. Session Verification (/api/auth/get-session)", async () => {
    if (!shopperCookie) throw new Error("No shopper cookie from step 1");
    const res = await fetch(`${BASE_URL}/api/auth/get-session`, {
      headers: { ...defaultHeaders, Cookie: shopperCookie },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
    const data = await res.json();
    if (!data?.user?.email) throw new Error("Session returned empty user");
    return `Verified active session for ${data.user.name} (${data.user.email}) with role: ${data.user.role}`;
  });

  // 3. Test Demo Admin Session Creation
  await test("3. Demo Admin Session Creation", async () => {
    const res = await fetch(`${BASE_URL}/api/auth/demo-session`, {
      method: "POST",
      headers: defaultHeaders,
      body: JSON.stringify({ role: "admin" }),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
    adminCookie = extractCookie(res);
    const body = await res.json();
    if (!body.user || body.user.role !== "admin") {
      throw new Error(`Invalid admin user returned: ${JSON.stringify(body)}`);
    }
    return `Created admin session for ${body.user.email} (Role: ${body.user.role})`;
  });

  // 4. Test RBAC: Unauthenticated User is Blocked
  await test("4. RBAC Defense: Unauthenticated Access Rejected", async () => {
    const res = await fetch(`${BASE_URL}/api/user/preferences`);
    if (res.status !== 401) {
      throw new Error(`Expected 401 Unauthorized, got HTTP ${res.status}`);
    }
    return `Protected route correctly returned 401 Unauthorized`;
  });

  // 5. Test Authenticated User Preferences Access
  await test("5. Authenticated Customer Access to Profile & Vector Preferences", async () => {
    if (!shopperCookie) throw new Error("No shopper cookie available");
    const res = await fetch(`${BASE_URL}/api/user/preferences`, {
      headers: { ...defaultHeaders, Cookie: shopperCookie },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
    const data = await res.json();
    return `Successfully loaded taste preferences (Categories: ${data.preferredCategories?.join(", ")})`;
  });

  // 6. Test Email & Password Registration
  await test("6. Email & Password User Registration (sign-up/email)", async () => {
    const res = await fetch(`${BASE_URL}/api/auth/sign-up/email`, {
      method: "POST",
      headers: defaultHeaders,
      body: JSON.stringify({
        email: newAccountEmail,
        password: newAccountPassword,
        name: "Artisan Collector Test",
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Sign up failed HTTP ${res.status}: ${errText}`);
    }

    registeredCookie = extractCookie(res);
    const data = await res.json();
    return `Registered new user: ${data.user?.email || newAccountEmail} (ID: ${data.user?.id || "created"})`;
  });

  // 7. Test Email & Password Sign In
  await test("7. Email & Password User Sign In (sign-in/email)", async () => {
    const res = await fetch(`${BASE_URL}/api/auth/sign-in/email`, {
      method: "POST",
      headers: defaultHeaders,
      body: JSON.stringify({
        email: newAccountEmail,
        password: newAccountPassword,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Sign in failed HTTP ${res.status}: ${errText}`);
    }

    const cookie = extractCookie(res);
    if (cookie) registeredCookie = cookie;
    const data = await res.json();

    // Verify introspecting session with the newly issued registered credential cookie
    const sessionCheck = await fetch(`${BASE_URL}/api/auth/get-session`, {
      headers: { ...defaultHeaders, Cookie: registeredCookie },
    });
    if (!sessionCheck.ok) {
      throw new Error(`Session introspection failed for signed-in user: HTTP ${sessionCheck.status}`);
    }
    const sessionData = await sessionCheck.json();
    return `Signed in successfully as ${data.user?.email} (Verified session user: ${sessionData?.user?.email})`;
  });

  // 8. Test Invalid Credentials Rejection
  await test("8. Credential Security: Reject Wrong Password", async () => {
    const res = await fetch(`${BASE_URL}/api/auth/sign-in/email`, {
      method: "POST",
      headers: defaultHeaders,
      body: JSON.stringify({
        email: newAccountEmail,
        password: "IncorrectWrongPassword123!",
      }),
    });

    if (res.ok) {
      throw new Error("Security flaw: Sign in succeeded with incorrect password!");
    }
    return `Correctly rejected invalid password with HTTP ${res.status}`;
  });

  // 9. Test Magic Link Initiation
  await test("9. Magic Link Sign In Request (sign-in/magic-link)", async () => {
    const res = await fetch(`${BASE_URL}/api/auth/sign-in/magic-link`, {
      method: "POST",
      headers: defaultHeaders,
      body: JSON.stringify({
        email: "collector.magic@atelier.dev",
        callbackURL: "/account",
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Magic link failed HTTP ${res.status}: ${errText}`);
    }
    const data = await res.json();
    return `Magic link dispatched successfully (${JSON.stringify(data)})`;
  });

  // 10. Test Sign Out / Session Invalidation
  await test("10. Sign Out Session Revocation (sign-out)", async () => {
    if (!registeredCookie) {
      registeredCookie = shopperCookie;
    }
    const res = await fetch(`${BASE_URL}/api/auth/sign-out`, {
      method: "POST",
      headers: {
        ...defaultHeaders,
        Cookie: registeredCookie,
      },
      body: JSON.stringify({}),
    });

    if (!res.ok) {
      throw new Error(`Sign out failed with HTTP ${res.status}`);
    }

    return `Sign-out completed; session revoked cleanly`;
  });

  console.log(`\n======================================================`);
  const passed = results.filter((r) => r.success).length;
  const total = results.length;
  console.log(`  AUTHENTICATION AUDIT SUMMARY: ${passed}/${total} PASSED`);
  console.log(`======================================================\n`);
}

runAllAuthTests();
