// src/app/api/auth/callback/route.ts
import { NextResponse } from 'next/server';
import crypto from 'crypto';

function generateHmac(params: URLSearchParams, secret: string) {
  const sortedParams = [...params.entries()]
    .filter(([key]) => key !== 'hmac' && key !== 'signature')
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([key, value]) => `${key}=${value}`)
    .join('&');

  return crypto.createHmac('sha256', secret).update(sortedParams).digest('hex');
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const shop = searchParams.get('shop');
  const hmac = searchParams.get('hmac');
  const code = searchParams.get('code');

  if (!shop || !hmac || !code) {
    return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
  }

  const generatedHmac = generateHmac(searchParams, process.env.SHOPIFY_API_SECRET!);
  if (generatedHmac !== hmac) {
    return NextResponse.json({ error: 'HMAC validation failed' }, { status: 403 });
  }

  const tokenResponse = await fetch(`https://${shop}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.SHOPIFY_API_KEY,
      client_secret: process.env.SHOPIFY_API_SECRET,
      code,
    }),
  });

  if (!tokenResponse.ok) {
    const errorText = await tokenResponse.text();
    return NextResponse.json({ error: 'Failed to obtain access token', details: errorText }, { status: 500 });
  }

  const tokenData = await tokenResponse.json();
  const accessToken = tokenData.access_token;
  //Temporary: log the token so ESLint sees it's used
  console.log('Obtained shopify access token:', accessToken);

  // TODO: Store the access token securely for future API calls

  return NextResponse.redirect(`${process.env.SHOPIFY_APP_URL}/dashboard?shop=${shop}`);
}
