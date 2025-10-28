# Continue Studio

## Project Vision

The goal of this project is to build a personal, open‑source AI studio that unifies code assistance, multimodal tools and device orchestration into one app.  It wraps ContinueDev’s CLI/core and LM Studio, runs on desktop (Tauri+React), web (Next.js), mobile (Expo SDK 54), and TUI (Ink), and supports local models on devices like the iPhone 17 Pro.  Everything is exposed through a versioned JSON‑RPC bridge, with shared chat, personas and multimodal attachments.

## Architecture Overview

- **Monorepo with PNPM workspaces** – a `packages/` folder for shared packages and an `apps/` folder for specific clients.
- **Protocol package** – defines JSON‑RPC request/response types and common data structures for sessions, messages, devices and leases.
- **Bridge** – a Node sidecar that listens for JSON‑RPC over WebSockets or stdio, spawns Continue CLI sessions, proxies LM Studio via OpenAI‑compatible APIs, and routes work between edge and remote devices.
- **Agent (Rust)** – a per‑device daemon that supervises LM Studio on Macs and Linux boxes, exposing start/stop and model management endpoints.  (Stubbed out for now.)
- **UI Kit / TUI Kit** – React component library for desktop/web/mobile and Ink components for the terminal client.
- **Apps** – clients for desktop (Tauri + Vite), web (Next.js), mobile (Expo), and TUI (Ink), all connecting to the Bridge via JSON‑RPC.
- **Multimodal support** – pipelines for speech‑to‑text, OCR and PDF ingestion (placeholders).

## Current Progress

This repository contains the skeleton of the system:

- Created the PNPM workspace and base TypeScript configuration.
- Added `packages/protocol` with type definitions for JSON‑RPC, devices and chat providers.
- Added `packages/bridge` with a WebSocket server, minimal router, CLI and LM Studio adapters, and a stub for a node‑pty interactive session.
- Implemented build scripts and a `pkg` wrapper to package the bridge as a Tauri sidecar.
- Added `apps/desktop` with a Vite + React shell that will become the Tauri frontend.
- Added `src-tauri/` with Tauri v2 configuration, capability file and shell plugin integration to spawn the Node sidecar.
- Added `apps/tui` using Ink with a basic prompt and token streaming output from the bridge.
- Added `apps/mobile` scaffolding on Expo SDK 54 with Reanimated 4 and NativeWind v5, plus placeholder providers for local (edge) and remote (LM Studio) chat and a config plugin stub for the iOS native LLM.
- Added a minimal `agent` crate in Rust to supervise LM Studio (start server and return base URL).
- Added helper scripts (`pkg-sidecar.cjs`, `doctor.cjs`) and README instructions.

## Next Steps

The plan moving forward includes:

- Complete the Edge engine by integrating the MLC LLM or llama.cpp iOS runtime in the mobile app, with a real Swift bridge and model management.
- Flesh out the Agent to manage LM Studio and report telemetry on the M4 Max and Blackwell devices.
- Implement the scheduler/router to decide whether to run a request on the iPhone, the M4 Max or the Blackwell based on model size, latency, privacy and battery considerations.
- Build full UIs for chat, code editing, diff previews, device management and multimodal uploads across desktop, web, mobile and TUI.
- Add device management via Tailscale or Headscale, with MagicDNS names, enrollment and policy.
- Harden security with encrypted storage, approvals for file/system commands, and end‑to‑end encrypted sync.
- Provide documentation, examples, contributor guidelines and start accepting community patches.
