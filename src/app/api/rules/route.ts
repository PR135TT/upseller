// src/app/api/rules/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// ① Inline Supabase client setup
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  // ② Parse the incoming JSON payload
  const { shop, trigger_product_id, upsell_product_id, message, discount_percent } =
    await request.json();

  // ③ Insert the new rule into Supabase
  const { data, error } = await supabase
    .from('upsell_rules')
    .insert([{
      shop,
      trigger_product_id,
      upsell_product_id,
      message,
      discount_percent
    }]);

  // ④ Handle any database errors
  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  // ⑤ Return success
  return NextResponse.json({ success: true, rule: data![0] });
}
