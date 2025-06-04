import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
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

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'Extract upsell rule data in JSON format with fields: trigger_product_id, upsell_product_id, message, discount_percent (number).' },
        { role: 'user', content: command },
      ],
    });

    const content = completion.choices[0]?.message?.content || '';
    let result;

    try {
      result = JSON.parse(content);
    } catch {
      return NextResponse.json({ success: false, error: 'Failed to parse response from AI' }, { status: 500 });
    }

    // Optional: Validate expected fields exist
    if (
      !result.trigger_product_id ||
      !result.upsell_product_id ||
      typeof result.discount_percent !== 'number' ||
      !result.message
    ) {
      return NextResponse.json({ success: false, error: 'Incomplete data from AI response' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: result });
  } catch (err) {
    console.error('API Error:', err);
    return NextResponse.json({ success: false, error: 'Failed to process rule' }, { status: 500 });
  }
}
