// src/app/api/rules/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Inline Supabase client setup
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET handler: return all upsell rules for a given shop
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const shop = searchParams.get('shop');
  if (!shop) {
    return NextResponse.json({ error: 'Missing shop parameter' }, { status: 400 });
  }

  const { data: rules, error } = await supabase
    .from('upsell_rules')
    .select('*')
    .eq('shop', shop);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(rules);
}

// POST handler: insert a new upsell rule
export async function POST(request: Request) {
  const { shop, trigger_product_id, upsell_product_id, message, discount_percent } =
    await request.json();

  const { data, error } = await supabase
    .from('upsell_rules')
    .insert([{
      shop,
      trigger_product_id,
      upsell_product_id,
      message,
      discount_percent
    }]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, rule: data![0] });
}
