// Serve the chat workload through web worker
import { ChatWorkerHandler, ChatModule } from "@mlc-ai/web-llm";

// --- WebGPU adapter-info polyfill inside the WORKER ---
try {
  const navAny = (self as any).navigator;
  const gpu = navAny?.gpu;
  if (gpu && typeof gpu.requestAdapter === "function") {
    const original = gpu.requestAdapter.bind(gpu);
    gpu.requestAdapter = async (...args: any[]) => {
      const adapter = await original(...args);
      if (adapter && typeof (adapter as any).requestAdapterInfo !== "function") {
        // Stub to avoid crashes on browsers that lack this API
        (adapter as any).requestAdapterInfo = async () => ({});
      }
      return adapter;
    };
  }
} catch { /* ignore */ }

// --- WebLLM wiring ---
const chat = new ChatModule();
const handler = new ChatWorkerHandler(chat);
self.onmessage = (msg: MessageEvent) => {
  handler.onmessage(msg);
};
