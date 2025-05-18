// src/app/api/shopify/register-script/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

interface ShopRecord { access_token: string; }

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  const { shop } = await request.json();
  if (!shop) {
    return NextResponse.json({ success: false, error: 'Missing shop' }, { status: 400 });
  }

  // 1) Fetch the merchant’s token
  const { data: shopRec, error: dbError } = await supabase
    .from('shops')
    .select('access_token')
    .eq('shop', shop)
    .single();

  if (dbError || !shopRec) {
    return NextResponse.json({ success: false, error: dbError?.message || 'No shop record' }, { status: 500 });
  }

  const scriptTagPayload = {
    script_tag: {
      event: 'onload',
      src: `${process.env.SHOPIFY_APP_URL}/upsell-snippet.js`,
    },
  };

  // 2) Call Shopify Admin API to register the tag
  const response = await fetch(
    `https://${shop}/admin/api/2023-10/script_tags.json`,
    {
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': shopRec.access_token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(scriptTagPayload),
    }
  );

  if (!response.ok) {
    const details = await response.text();
    return NextResponse.json({ success: false, error: details }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
