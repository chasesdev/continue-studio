import { execa } from 'execa';
import type { Msg } from '@cs/protocol';
import OpenAI from 'openai';
import http from 'node:http';

// Starts LM Studio server if not already running and returns the baseURL for OpenAI-compatible endpoints.
export async function ensureLMServer(device: { name: string; port?: number; cors?: boolean }) {
  const port = device.port ?? 1234;
  // For now, spawn local LM Studio. In a production system, call the agent on the target device.
  try {
    execa('lms', ['server', 'start', '--port', String(port), '--cors'], { stdio: 'ignore' });
  } catch (err) {
    // ignore errors when LM Studio already running
  }
  await waitHealthy(`http://${device.name}:${port}/v1/models`);
  return { baseURL: `http://${device.name}:${port}/v1` };
}

function waitHealthy(url: string, timeoutMs = 8000): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  return new Promise((resolve, reject) => {
    const check = () => {
      const req = http.get(url, (res) => {
        if (res.statusCode === 200) resolve(); else retry();
      });
      req.on('error', retry);
      function retry() {
        if (Date.now() < deadline) setTimeout(check, 300);
        else reject(new Error('LM Studio not responding'));
      }
    };
    check();
  });
}

export async function* callOpenAICompat(opts: {
  baseURL: string;
  messages: Msg[];
  model: string;
  maxTokens?: number;
  temperature?: number;
}) {
  const client = new OpenAI({ baseURL: opts.baseURL, apiKey: 'lm-studio' });
  const stream = await client.chat.completions.create({
    model: opts.model,
    messages: opts.messages,
    stream: true,
    max_tokens: opts.maxTokens,
    temperature: opts.temperature,
  } as any);
  for await (const chunk of stream) {
    const token = chunk?.choices?.[0]?.delta?.content ?? '';
    if (token) yield { token };
  }
  yield { done: true };
}