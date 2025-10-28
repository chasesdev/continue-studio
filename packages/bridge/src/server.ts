import 'dotenv/config';
import { WebSocketServer } from 'ws';
import type { JsonRpcReq, JsonRpcRes, Msg } from '@cs/protocol';
import { runHeadless, attachPTY } from './adapters/continue-cli.js';
import { ensureLMServer, callOpenAICompat } from './adapters/lmstudio.js';
import { chooseTarget } from './providers/router.js';

const port = Number(process.env.BRIDGE_PORT ?? 8123);
const wss = new WebSocketServer({ port });
console.log(`[bridge] listening on ${port}`);

wss.on('connection', (ws) => {
  ws.on('message', async (data) => {
    const req: JsonRpcReq = JSON.parse(String(data));
    const send = (res: Partial<JsonRpcRes>) => ws.send(JSON.stringify({ jsonrpc: '2.0', id: req.id, ...res }));
    try {
      if (req.method === 'router.lease') {
        const lease = await chooseTarget(req.params);
        send({ result: lease });
      } else if (req.method === 'continue.run') {
        for await (const evt of runHeadless(req.params.prompt, req.params.cwd)) {
          ws.send(
            JSON.stringify({
              jsonrpc: '2.0',
              id: req.id,
              event: evt,
            }),
          );
        }
        send({ result: { done: true } });
      } else if (req.method === 'continue.attach') {
        const stream = await attachPTY(req.params.cwd);
        for await (const chunk of stream) {
          ws.send(
            JSON.stringify({
              jsonrpc: '2.0',
              id: req.id,
              event: { tty: chunk },
            }),
          );
        }
      } else if (req.method === 'lm.start') {
        const { baseURL } = await ensureLMServer(req.params.device);
        send({ result: { baseURL } });
      } else if (req.method === 'chat.openai') {
        const { baseURL, messages, model, maxTokens, temperature } = req.params as {
          baseURL: string;
          messages: Msg[];
          model: string;
          maxTokens?: number;
          temperature?: number;
        };
        for await (const evt of callOpenAICompat({ baseURL, messages, model, maxTokens, temperature })) {
          ws.send(
            JSON.stringify({
              jsonrpc: '2.0',
              id: req.id,
              event: evt,
            }),
          );
        }
        send({ result: { done: true } });
      } else {
        send({ error: { code: -32601, message: `Unknown method ${req.method}` } });
      }
    } catch (err: any) {
      send({ error: { code: -32000, message: err.message } });
    }
  });
});