// src/app/api/parse-rule/route.ts

import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '', // Required for instantiation
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const command = body?.command?.trim();
    if (!command) {
      return NextResponse.json({ success: false, error: 'No command provided' }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ success: false, error: 'OpenAI API key is missing' }, { status: 500 });
    }

    // Simulated OpenAI request (replace with actual model call later)
    // const completion = await openai.chat.completions.create({
    //   model: 'gpt-4',
    //   messages: [{ role: 'user', content: command }],
    // });

    // Simulated result for now:
    const result = {
      trigger_product_id: '12345',
      upsell_product_id: '67890',
      message: 'Buy X and get Y at 20% off!',
      discount_percent: 20,
    };

    return NextResponse.json({ success: true, data: result });
  } catch (err) {
    console.error('API Error:', err);
    return NextResponse.json({ success: false, error: 'Failed to process rule' }, { status: 500 });
  }
}
