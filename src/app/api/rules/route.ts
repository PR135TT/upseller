// src/app/api/rules/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Define your Rule type to help TypeScript
interface Rule {
  id?:                string;
  shop:              string;
  trigger_product_id: string;
  upsell_product_id:  string;
  message:           string;
  discount_percent:  number;
}

// Inline Supabase client setup
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// DELETE handler: remove a rule by ID
export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const shop = searchParams.get('shop');
  if (!id || !shop) {
    return NextResponse.json({ success: false, error: 'Missing id or shop' }, { status: 400 });
  }

  // Delete only if it belongs to this shop
  const { error } = await supabase
    .from('upsell_rules')
    .delete()
    .match({ id, shop });

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

// Unified JSON response wrapper types
interface JsonSuccess<T> { success: true; data: T }
interface JsonError        { success: false; error: string }
type JsonResponse<T> = JsonSuccess<T> | JsonError;

// GET handler: return all upsell rules for a given shop
export async function GET(request: Request) {
  const shop = new URL(request.url).searchParams.get('shop');
  if (!shop) {
    return NextResponse.json<JsonResponse<null>>({ success: false, error: 'Missing shop parameter' }, { status: 400 });
  }

  try {
    const { data: rules, error } = await supabase
      .from('upsell_rules')
      .select('*')
      .eq('shop', shop);

    if (error) {
      return NextResponse.json<JsonResponse<null>>({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json<JsonResponse<Rule[]>>({ success: true, data: rules || [] });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json<JsonResponse<null>>({ success: false, error: message }, { status: 500 });
  }
}

// POST handler: insert a new upsell rule
export async function POST(request: Request) {
  try {
    const { shop, trigger_product_id, upsell_product_id, message, discount_percent } = await request.json() as Partial<Rule>;
    if (!shop || !trigger_product_id || !upsell_product_id || !message) {
      return NextResponse.json<JsonResponse<null>>({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('upsell_rules')
      .insert([{ shop, trigger_product_id, upsell_product_id, message, discount_percent: discount_percent! }])
      .select('*');

    if (error) {
      return NextResponse.json<JsonResponse<null>>({ success: false, error: error.message }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json<JsonResponse<null>>({ success: false, error: 'No data returned from insert' }, { status: 500 });
    }

    return NextResponse.json<JsonResponse<Rule>>({ success: true, data: data[0] });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json<JsonResponse<null>>({ success: false, error: message }, { status: 500 });
  }
}
