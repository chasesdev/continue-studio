import OpenAI from 'openai';
import type { Msg } from '@cs/protocol';

export async function* chatLMStudio(
  baseURL: string,
  messages: Msg[],
  opts: { model: string; maxTokens?: number; temperature?: number },
) {
  const client = new OpenAI({ baseURL, apiKey: 'lm-studio' });
  const stream = await client.chat.completions.create({
    model: opts.model,
    messages,
    stream: true,
  } as any);
  for await (const chunk of stream) {
    const token = chunk?.choices?.[0]?.delta?.content ?? '';
    if (token) {
      yield { token };
    }
  }
  yield { done: true };
}