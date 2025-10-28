import type { Lease } from '@cs/protocol';

// A naive router to pick which target device should handle a request based on the task and device reachability.
export async function chooseTarget(params: {
  task: {
    modality: 'text' | 'voice' | 'image' | 'code';
    inputTokens: number;
    outputTokens: number;
    privacyHard?: boolean;
    needTTFBms?: number;
  };
  reach: { edge: boolean; m4: boolean; blackwell: boolean };
}): Promise<Lease> {
  const { task, reach } = params;
  // Prefer on-device for privacy-critical small tasks
  if (task.privacyHard && reach.edge && task.inputTokens <= 1000 && task.outputTokens <= 200) {
    return { target: 'edge-ios', ttlMs: 60_000, reason: 'privacy-short' };
  }
  // Send long outputs to Blackwell if available
  if (task.outputTokens >= 1000 && reach.blackwell) {
    return { target: 'blackwell', ttlMs: 120_000, reason: 'long-output' };
  }
  // Default to M4 for everything else if reachable
  if (reach.m4) {
    return { target: 'm4', ttlMs: 60_000, reason: 'default' };
  }
  // Fallback to edge
  return { target: 'edge-ios', ttlMs: 30_000, reason: 'fallback' };
}