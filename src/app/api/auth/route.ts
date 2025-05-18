// src/app/api/auth/callback/route.ts
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function generateHmac(params: URLSearchParams, secret: string) {
  const sorted = [...params.entries()]
    .filter(([k]) => k !== 'hmac' && k !== 'signature')
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('&');
  return crypto.createHmac('sha256', secret).update(sorted).digest('hex');
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const shop = searchParams.get('shop');
  const hmac = searchParams.get('hmac');
  const code = searchParams.get('code');

  if (!shop || !hmac || !code) {
    return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
  }

  // 1) Validate HMAC
  const generated = generateHmac(searchParams, process.env.SHOPIFY_API_SECRET!);
  if (generated !== hmac) {
    return NextResponse.json({ error: 'HMAC validation failed' }, { status: 403 });
  }

  // 2) Exchange code for an access token
  const tokenRes = await fetch(`https://${shop}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id:     process.env.SHOPIFY_API_KEY,
      client_secret: process.env.SHOPIFY_API_SECRET,
      code,
    }),
  });

  if (!tokenRes.ok) {
    const details = await tokenRes.text();
    return NextResponse.json({ error: 'Token exchange failed', details }, { status: 500 });
  }

  const { access_token } = await tokenRes.json();

  // 3) Persist the token
  const { error: dbError } = await supabase
    .from('shops')
    .upsert({ shop, access_token });

  if (dbError) {
    return NextResponse.json({ error: 'Database upsert failed', details: dbError.message }, { status: 500 });
  }

  // 4) Auto-register the snippet (non-blocking)
  (async () => {
    try {
      await fetch(`${process.env.SHOPIFY_APP_URL}/api/shopify/register-script`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ shop }),
      });
    } catch (err) {
      console.error('Snippet registration failed:', err);
    }
  })();

  // 5) Redirect merchant to dashboard
  const baseUrl = process.env.SHOPIFY_APP_URL!.replace(/\/+$/, '');
  return NextResponse.redirect(`${baseUrl}/dashboard?shop=${shop}`);
}
