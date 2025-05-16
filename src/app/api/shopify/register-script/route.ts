// src/app/api/shopify/register-script/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  // 1) Parse shop from request body
  const { shop } = await request.json();
  if (!shop) {
    return NextResponse.json({ error: 'Missing shop' }, { status: 400 });
  }

  // 2) Retrieve access token from Supabase
  const { data: shopRecord, error: fetchError } = await supabase
    .from('shops')
    .select('access_token')
    .eq('shop', shop)
    .single();

  if (fetchError || !shopRecord) {
    return NextResponse.json(
      { error: 'Could not fetch shop token', details: fetchError?.message },
      { status: 500 }
    );
  }

  const accessToken = shopRecord.access_token;

  // 3) Register the script tag with Shopify
  const scriptTagPayload = {
    script_tag: {
      event: 'onload',
      src: `${process.env.SHOPIFY_APP_URL}/upsell-snippet.js`,
    },
  };

  const response = await fetch(
    `https://${shop}/admin/api/2023-10/script_tags.json`,
    {
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(scriptTagPayload),
    }
  );

  if (!response.ok) {
    const details = await response.text();
    return NextResponse.json(
      { error: 'Failed to register script tag', details },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
