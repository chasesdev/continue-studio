import type { ChatProvider, Msg } from '@cs/protocol';
// Placeholder local engine; will be replaced with native module bridging MLC or llama.cpp on iOS.
export const LocalEngine: ChatProvider = {
  name: 'edge-ios',
  supports: { audio: true },
  async *chat(messages: Msg[], opts: { model: string }) {
    const fake = `(${opts.model}) ${messages.at(-1)?.content ?? ''}`;
    for (const token of fake.split(' ')) {
      yield { token: token + ' ' };
      await new Promise((r) => setTimeout(r, 30));
    }
    yield { done: true };
  },
};