// src/app/api/shop-status/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const shop = searchParams.get('shop')!;
  if (!shop) {
    return NextResponse.json({ installed: false }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('shops')
    .select('shop')
    .eq('shop', shop)
    .limit(1);

  if (error) {
    return NextResponse.json({ installed: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ installed: Array.isArray(data) && data.length > 0 });
}
