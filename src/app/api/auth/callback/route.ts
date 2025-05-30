// src/app/api/auth/callback/route.ts
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

// ① Inline instantiation of Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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

  console.log(Object.fromEntries(searchParams.entries()));

  // 1) Validate the HMAC signature
  const generatedHmac = generateHmac(searchParams, process.env.SHOPIFY_API_SECRET!);
  if (generatedHmac !== hmac) {
    return NextResponse.json({ error: 'HMAC validation failed' }, { status: 403 });
  }

  // 2) Exchange the authorization code for an access token
  const tokenResponse = await fetch(`https://${shop}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id:     process.env.SHOPIFY_API_KEY,
      client_secret: process.env.SHOPIFY_API_SECRET,
      code,
    }),
  });
  if (!tokenResponse.ok) {
    const details = await tokenResponse.text();
    return NextResponse.json({ error: 'Token exchange failed', details }, { status: 500 });
  }

  const { access_token } = await tokenResponse.json();

  // 3) Persist the access token to Supabase
  const { error: dbError } = await supabase
    .from('shops')
    .upsert({ shop, access_token });
  if (dbError) {
    return NextResponse.json({ error: 'Database upsert failed', details: dbError.message }, { status: 500 });
  }

  // 4) Register the upsell snippet with Shopify
  try {
    await fetch(`${process.env.SHOPIFY_APP_URL}/api/shopify/register-script`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shop }),
    });
  } catch (err) {
    console.error('🚨 Script tag registration failed:', err);
    // proceed without blocking the merchant
  }

  // 5) Redirect merchant back to your dashboard
  return NextResponse.redirect(`${process.env.SHOPIFY_APP_URL}/dashboard?shop=${shop}`);
}
