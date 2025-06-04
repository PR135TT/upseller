// src/app/api/parse-rule/route.ts

import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ success: false, error: 'OpenAI API key is missing' }, { status: 500 });
    }

    const { command } = await req.json();

    // Use openai.chat.completions.create or whatever logic you have here
    // Assume it returns a result:
    const result = {
      trigger_product_id: '12345',
      upsell_product_id: '67890',
      message: 'Upsell message here',
      discount_percent: 20,
    };

    return NextResponse.json({ success: true, data: result });
  } catch (err) {
    console.error('API Error:', err);
    return NextResponse.json({ success: false, error: 'Failed to process rule' }, { status: 500 });
  }
}
