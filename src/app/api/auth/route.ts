// src/app/api/auth/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const shop = searchParams.get('shop');

  if (!shop) {
    return NextResponse.json({ error: 'Missing shop parameter' }, { status: 400 });
  }

  //const baseUrl = process.env.SHOPIFY_APP_URL!.replace(/\/+$/, '');
  const redirectUrl = `${process.env.SHOPIFY_APP_URL}/api/auth/callback`;
  console.log (' Redirect URI: ', redirectUrl);
  const scopes = process.env.SHOPIFY_SCOPES || 'read_products';

  const installUrl = `https://${shop}/admin/oauth/authorize?client_id=${process.env.SHOPIFY_API_KEY}&scope=${scopes}&redirect_url=${encodeURIComponent(redirectUrl)}&state=123456&grant_options[]=per-user`;
  console.log(' Install URL: ', installUrl);


  return NextResponse.redirect(installUrl);
}
