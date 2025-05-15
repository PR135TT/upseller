// src/app/api/auth/callback/route.ts
import { NextResponse } from "next/server";
import crypto from "crypto";
import { URL } from "url";

function generateHmac(params: URLSearchParams, secret: string) {
  const sorted = [...params.entries()]
    .filter(([key]) => key !== "hmac" && key !== "signature")
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([k, v]) => `${k}=${v}`)
    .join("&");

  return crypto.createHmac("sha256", secret).update(sorted).digest("hex");
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const shop = searchParams.get("shop");
  const hmac = searchParams.get("hmac");
  const code = searchParams.get("code");

  if (!shop || !hmac || !code) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  // Validate HMAC
  const generatedHmac = generateHmac(searchParams, process.env.SHOPIFY_API_SECRET!);
  if (generatedHmac !== hmac) {
    return NextResponse.json({ error: "Invalid HMAC" }, { status: 403 });
  }

  // Exchange code for access token
  const accessTokenResponse = await fetch(`https://${shop}/admin/oauth/access_token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: process.env.SHOPIFY_API_KEY,
      client_secret: process.env.SHOPIFY_API_SECRET,
      code,
    }),
  });

  if (!accessTokenResponse.ok) {
    const err = await accessTokenResponse.text();
    return NextResponse.json({ error: "Failed to get access token", details: err }, { status: 500 });
  }

  const tokenData = await accessTokenResponse.json();
  const accessToken = tokenData.access_token;

  // Store token securely (in a DB or memory - this example doesn't persist)
  console.log("✅ Store Access Token:", shop, accessToken);

  // Redirect to dashboard or success page
  return NextResponse.redirect(`${process.env.SHOPIFY_APP_URL}/dashboard?shop=${shop}`);
}
