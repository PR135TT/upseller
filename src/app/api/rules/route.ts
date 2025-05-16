import { NextResponse } from 'next/server';
// ← Again, bring in the same client
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
export async function POST(request: Request) {
  const { shop, trigger_product_id, upsell_product_id, message, discount_percent } = await request.json();

  // ← Use supabase to insert a new rule
  const { data, error } = await supabase
    .from('upsell_rules')
    .insert([{ shop, trigger_product_id, upsell_product_id, message, discount_percent }]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, });
}
