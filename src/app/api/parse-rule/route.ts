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
      console.error('❌ Missing OpenAI API Key in environment variables');
      return NextResponse.json({ success: false, error: 'OpenAI API key is missing' }, { status: 500 });
    }

    let completion;
    try {
      completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content:
              'Extract upsell rule data in JSON format with fields: trigger_product_id, upsell_product_id, message, discount_percent (number).',
          },
          { role: 'user', content: command },
        ],
      });
    } catch (apiError) {
      console.error('❌ OpenAI API request failed:', apiError);
      return NextResponse.json({ success: false, error: 'OpenAI API request failed' }, { status: 500 });
    }

    const content = completion.choices[0]?.message?.content || '';
    let result;

    try {
      result = JSON.parse(content);
    } catch (parseError) {
      console.error('❌ Failed to parse AI response:', content);
      console.error('⛔ Parse error details:', parseError);
      return NextResponse.json({ success: false, error: 'Failed to parse response from AI' }, { status: 500 });
    }

    if (
      !result.trigger_product_id ||
      !result.upsell_product_id ||
      typeof result.discount_percent !== 'number' ||
      !result.message
    ) {
      console.error('⚠️ Incomplete or invalid AI response:', result);
      return NextResponse.json({ success: false, error: 'Incomplete data from AI response' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: result });
  } catch (err) {
    console.error('🔥 Unexpected API Error:', err);
    return NextResponse.json({ success: false, error: 'Failed to process rule' }, { status: 500 });
  }
}
