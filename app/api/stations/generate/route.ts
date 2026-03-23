import { NextRequest, NextResponse } from 'next/server';
import { zaiChatCompletion } from '@/lib/zai';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface Persona {
  agentName: string;
  shortLore: string;
}

function extractJson(text: string) {
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/) || text.match(/(\{[\s\S]*\})/);
  return jsonMatch ? jsonMatch[1].trim() : text;
}

function normalizePersonas(raw: unknown): Persona[] {
  const personas = (raw as { personas?: unknown[] })?.personas;
  if (!Array.isArray(personas)) {
    return [];
  }

  return personas
    .map((item) => {
      const value = item as Record<string, unknown>;
      const agentName = String(value.agentName || '').trim();
      const shortLore = String(value.shortLore || '').trim();
      if (!agentName || !shortLore) {
        return null;
      }
      return { agentName, shortLore };
    })
    .filter((item): item is Persona => item !== null)
    .slice(0, 4);
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { lore?: string };
    const lore = String(body?.lore || '').trim();

    if (!lore) {
      return NextResponse.json({ error: 'Lore is required.' }, { status: 400 });
    }

    const content = await zaiChatCompletion(
      [
        {
          role: 'user',
          content: `Generate 4 distinct AI whistleblower personas based on this lore: "${lore}". They are broadcasting synthetic truths from the edges of the web.\n\nRespond ONLY with valid JSON containing a \"personas\" array where each item has:\n- agentName: A cryptic, hacker-style name for the agent\n- shortLore: A 1-sentence summary of what they are broadcasting`,
        },
      ],
      {
        maxTokens: 350,
        temperature: 0.8,
      }
    );

    const jsonText = extractJson(content);
    const parsed = JSON.parse(jsonText);
    const personas = normalizePersonas(parsed);

    if (personas.length === 0) {
      return NextResponse.json({ error: 'No personas were generated.' }, { status: 502 });
    }

    return NextResponse.json({ personas });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to generate stations',
      },
      { status: 500 }
    );
  }
}
