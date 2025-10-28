import React, { useEffect, useRef, useState } from 'react';

export const App = () => {
  const [connected, setConnected] = useState(false);
  const [out, setOut] = useState('');
  const wsRef = useRef<WebSocket | null>(null);
  useEffect(() => {
    const ws = new WebSocket('ws://127.0.0.1:8123');
    wsRef.current = ws;
    ws.onopen = () => setConnected(true);
    ws.onmessage = (ev) => {
      const msg = JSON.parse(String(ev.data));
      if (msg.event?.token) setOut((s) => s + msg.event.token);
    };
    return () => ws.close();
  }, []);
  function run() {
    wsRef.current?.send(
      JSON.stringify({
        jsonrpc: '2.0',
        id: Date.now(),
        method: 'continue.run',
        params: { cwd: process.cwd(), prompt: 'hello from desktop' },
      }),
    );
  }
  return (
    <div style={{ padding: 12, fontFamily: 'ui-monospace, SFMono-Regular' }}>
      <h3>Continue Studio (Desktop)</h3>
      <button onClick={run} disabled={!connected}>
        Run
      </button>
      <pre style={{ whiteSpace: 'pre-wrap' }}>{out}</pre>
    </div>
  );
};