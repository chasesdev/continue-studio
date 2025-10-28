import { execa } from 'execa';
import pty from 'node-pty';

// Runs a prompt using the Continue CLI in headless mode (-p), streaming standard output as tokens.
export async function* runHeadless(prompt: string, cwd: string) {
  const child = execa('cn', ['-p', prompt], { cwd });
  // Ensure output streams in UTF-8 for token splitting.
  child.stdout?.setEncoding('utf8');
  for await (const chunk of child.stdout!) {
    yield { token: chunk };
  }
  await child;
}

// Attaches to an interactive Continue session via a pseudo-terminal (PTY). Returns an async iterator of data chunks.
export async function attachPTY(cwd: string) {
  const shellCmd = process.platform === 'win32' ? 'powershell.exe' : 'bash';
  const term = pty.spawn('cn', [], {
    cwd,
    name: 'xterm-color',
    cols: 120,
    rows: 30,
    env: process.env,
  });
  const stream = new ReadableStream<string>({
    start(controller) {
      term.onData((data) => controller.enqueue(data));
      term.onExit(() => controller.close());
    },
  });
  // @ts-ignore: Convert ReadableStream to async iterator
  return stream;
}