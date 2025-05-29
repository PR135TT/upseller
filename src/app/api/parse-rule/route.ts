// src/app/api/parse-rule/route.ts
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(request: Request) {
  const { command } = await request.json();
  if (typeof command !== 'string' || command.trim().length === 0) {
    return NextResponse.json({ error: 'Missing or invalid command' }, { status: 400 });
  }

  const prompt = `
Extract this instruction into a JSON object with the following exact keys:
- trigger_product_id (string or number)
- upsell_product_id (string or number)
- message (string)
- discount_percent (number)

Only return valid JSON. Do NOT wrap it in code blocks or markdown.

Instruction: "${command}"
`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0,
  });

  const content = completion.choices[0].message?.content || '';
  console.log('OpenAI response:', content); // 🔍 Optional debug log

  try {
    const data = JSON.parse(content);
    if (
      !data.trigger_product_id ||
      !data.upsell_product_id ||
      !data.message ||
      typeof data.discount_percent !== 'number'
    ) {
      throw new Error('Incomplete parsing result');
    }
    return NextResponse.json({ data });
  } catch (err) {
  if (err instanceof Error) {
    return NextResponse.json({ error: 'Failed to parse command: ' + err.message }, { status: 400 });
  }
  return NextResponse.json({ error: 'Unknown error occurred' }, { status: 400 });
}
}
