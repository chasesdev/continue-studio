export type Id = string | number;
export type JsonRpcReq = { jsonrpc: '2.0'; id: Id; method: string; params?: any };
export type JsonRpcRes = { jsonrpc: '2.0'; id: Id; result?: any; error?: { code: number; message: string; data?: any } };

export type DeviceId = string;
export type LeaseTarget = 'edge-ios' | 'm4' | 'blackwell';

export interface Device {
  id: DeviceId;
  name: string;
  os: 'ios' | 'mac' | 'linux' | 'win';
  metrics?: {
    cpu?: number;
    memGB?: number;
    gpuUtil?: number;
    tps?: number;
    batteryPct?: number;
    thermal?: 'nominal' | 'fair' | 'serious';
  };
  baseURL?: string;
}

export type Msg = { role: 'system' | 'user' | 'assistant' | 'tool'; content: string };

export interface Lease {
  target: LeaseTarget;
  baseURL?: string;
  ttlMs: number;
  reason: string;
}

export interface ChatProvider {
  name: string;
  supports?: { vision?: boolean; audio?: boolean };
  chat(
    messages: Msg[],
    opts: { model: string; maxTokens?: number; temperature?: number }
  ): AsyncIterable<{ token?: string; done?: boolean }>;
}