// src/app/api/auth/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const shop = searchParams.get('shop');

  if (!shop) {
    return NextResponse.json({ error: 'Missing shop parameter' }, { status: 400 });
  }

  // Normalize your app URL and callback path
  const baseUrl     = process.env.SHOPIFY_APP_URL!.replace(/\/+$/, '');
  const redirectUri = `${baseUrl}/api/auth/callback`;

  // Use the scopes you configured in env
  const scopes      = process.env.SHOPIFY_SCOPES!;
  const installUrl  =
    `https://${shop}/admin/oauth/authorize` +
    `?client_id=${process.env.SHOPIFY_API_KEY}` +
    `&scope=${encodeURIComponent(scopes)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&state=nonce123` +
    `&grant_options[]=per-user`;

  console.log('👉 Redirecting merchant to:', installUrl);
  return NextResponse.redirect(installUrl);
}
