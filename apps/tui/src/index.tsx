import React, { useEffect, useState } from 'react';
import { render, Box, Text, useInput } from 'ink';
import WebSocket from 'ws';

function useBridge() {
  const [tokens, setTokens] = useState('');
  const [connected, setConnected] = useState(false);
  const [ws, setWs] = useState<WebSocket | null>(null);

  useEffect(() => {
    const socket = new WebSocket('ws://127.0.0.1:8123');
    setWs(socket);
    socket.onopen = () => setConnected(true);
    socket.onmessage = (ev) => {
      const msg = JSON.parse(String(ev.data));
      if (msg.event?.token) {
        setTokens((t) => t + msg.event.token);
      }
    };
    return () => socket.close();
  }, []);

  function prompt(p: string) {
    if (!ws) return;
    ws.send(
      JSON.stringify({
        jsonrpc: '2.0',
        id: Date.now(),
        method: 'continue.run',
        params: { cwd: process.cwd(), prompt: p },
      }),
    );
  }

  return { connected, tokens, prompt };
}

const App = () => {
  const { connected, tokens, prompt } = useBridge();
  const [buf, setBuf] = useState('');
  useInput((input, key) => {
    if (key.return) {
      prompt(buf);
      setBuf('');
      return;
    }
    if (key.backspace) setBuf((s) => s.slice(0, -1));
    else setBuf((s) => s + input);
  });
  return (
    <Box flexDirection="column">
      <Text color="green">{connected ? '●' : '○'} Continue Studio</Text>
      <Text>Prompt: {buf}</Text>
      <Box borderStyle="round" padding={1}>
        <Text>{tokens}</Text>
      </Box>
    </Box>
  );
};

render(<App />);