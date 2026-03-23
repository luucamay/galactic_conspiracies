type ChatRole = 'system' | 'user' | 'assistant';

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

interface ChatOptions {
  maxTokens?: number;
  temperature?: number;
  model?: string;
}

interface ZAIChatResponse {
  choices?: Array<{
    finish_reason?: string;
    message?: {
      content?: string | Array<{ text?: string; type?: string }>;
      reasoning_content?: string;
    };
  }>;
  error?: {
    message?: string;
  };
}

function extractContent(payload: ZAIChatResponse) {
  const content = payload.choices?.[0]?.message?.content;

  if (typeof content === 'string') {
    return content.trim();
  }

  if (Array.isArray(content)) {
    return content
      .map((part) => (typeof part?.text === 'string' ? part.text : ''))
      .join('')
      .trim();
  }

  return '';
}

async function requestCompletion(messages: ChatMessage[], options: ChatOptions, maxTokens: number) {
  const response = await fetch(`${getBaseUrl()}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getApiKey()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: options.model || getZaiModel(),
      messages,
      max_tokens: maxTokens,
      temperature: options.temperature ?? 0.7,
      stream: false,
      thinking: {
        type: 'disabled',
      },
    }),
  });

  const payload = (await response.json()) as ZAIChatResponse;

  if (!response.ok) {
    throw new Error(payload.error?.message || `Z.AI request failed with status ${response.status}`);
  }

  return payload;
}

const DEFAULT_ZAI_BASE_URL = 'https://api.z.ai/api/paas/v4';
const DEFAULT_ZAI_MODEL = 'glm-4.5-flash';

function getBaseUrl() {
  return (process.env.ZAI_BASE_URL || DEFAULT_ZAI_BASE_URL).replace(/\/$/, '');
}

function getApiKey() {
  const key = process.env.ZAI_API_KEY;
  if (!key) {
    throw new Error('ZAI_API_KEY is not configured.');
  }
  return key;
}

export function getZaiModel() {
  return process.env.ZAI_MODEL || DEFAULT_ZAI_MODEL;
}

export async function zaiChatCompletion(messages: ChatMessage[], options: ChatOptions = {}) {
  const requestedMaxTokens = options.maxTokens ?? 200;

  let payload = await requestCompletion(messages, options, requestedMaxTokens);
  let content = extractContent(payload);

  if (!content && payload.choices?.[0]?.finish_reason === 'length') {
    const retriedMaxTokens = Math.min(Math.max(requestedMaxTokens * 2, 400), 2000);
    payload = await requestCompletion(messages, options, retriedMaxTokens);
    content = extractContent(payload);
  }

  if (!content) {
    const finishReason = payload.choices?.[0]?.finish_reason;
    throw new Error(
      `Z.AI returned an empty response${finishReason ? ` (finish_reason=${finishReason})` : ''}.`
    );
  }

  return content;
}
