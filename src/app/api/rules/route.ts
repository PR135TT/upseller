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
    return NextResponse.json({ success: false, error: 'Missing shop parameter' }, { status: 400 });
  }

  try {
    const { data: rules, error } = await supabase
      .from('upsell_rules')
      .select('*')
      .eq('shop', shop);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, rules });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// POST handler: insert a new upsell rule
export async function POST(request: Request) {
  try {
    const body = await request.text();
    if (!body) {
      return NextResponse.json({ success: false, error: 'Empty request body' }, { status: 400 });
    }

    const { shop, trigger_product_id, upsell_product_id, message, discount_percent } = JSON.parse(body);
    if (!shop || !trigger_product_id || !upsell_product_id || !message) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('upsell_rules')
      .insert([{ shop, trigger_product_id, upsell_product_id, message, discount_percent }]);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, rule: data![0] });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
