// src/app/api/auth/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const shop = searchParams.get('shop');

  if (!shop) {
    return NextResponse.json({ error: 'Missing shop parameter' }, { status: 400 });
  }

  // 1️⃣ Normalize your base URL (remove any trailing slash)
  const baseUrl = process.env.SHOPIFY_APP_URL!.replace(/\/+$/, '');

  // 2️⃣ Build a single redirectUri string and log it
  const redirectUri = `${baseUrl}/api/auth/callback`;
  console.log('🔗 Redirect URI:', redirectUri);

  const scopes = process.env.SHOPIFY_SCOPES || 'read_products';

  // 3️⃣ Use the SAME redirectUri variable (URL-encoded) in your install URL
  const installUrl =
    `https://${shop}/admin/oauth/authorize` +
    `?client_id=${process.env.SHOPIFY_API_KEY}` +
    `&scope=${encodeURIComponent(scopes)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&state=nonce123` +
    `&grant_options[]=per-user`;

  console.log('🔗 Install URL:', installUrl);

  return NextResponse.redirect(installUrl);
}
