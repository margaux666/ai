"use client";

import { useEffect, useState } from "react";
import { useChat, type Message } from "ai/react";
import { cn } from "@/lib/utils";

import { ChatList } from "@/components/chat-list";
import { ChatPanel } from "@/components/chat-panel";
import { EmptyScreen } from "@/components/empty-screen";
import { ChatScrollAnchor } from "@/components/chat-scroll-anchor";
import { useLocalChat } from "@/lib/wasmllm/use-wasm-llm";
import { SUPPORTED_LOCAL_MODELS } from "@/lib/wasmllm/supported-models";
import { loadNotes } from "@/lib/corpus";
import toast from "react-hot-toast";

export interface ChatProps extends React.ComponentProps<"div"> {
  initialMessages?: Message[];
  id?: string;
}

const USE_LOCAL_CHAT = true;
const localModelName: keyof typeof SUPPORTED_LOCAL_MODELS = "dolphin-2.2.1";

export function Chat({ id, initialMessages, className }: ChatProps) {
  const selectedModel = SUPPORTED_LOCAL_MODELS[localModelName];

  // Load NOTES once
  const [systemNotes, setSystemNotes] = useState<string | null>(null);
  useEffect(() => {
    loadNotes().then(setSystemNotes).catch(() => setSystemNotes(""));
  }, []);

  const seededMessages: Message[] = systemNotes
    ? [{ id: "sys-1", role: "system", content: systemNotes }, ...(initialMessages ?? [])]
    : initialMessages ?? [];

  // CALL BOTH HOOKS UNCONDITIONALLY (no conditional hooks)
  const local = useLocalChat({
    model: selectedModel,
    initialMessages: seededMessages,
    initialInput: "",
  });

  const cloud = useChat({
    initialMessages: seededMessages,
    id,
    body: { id },
    onResponse(response) {
      if (response.status === 401) toast.error(response.statusText);
    },
  });

  // Pick which set to use
  const api = USE_LOCAL_CHAT
    ? local
    : { ...cloud, loadingMessage: "You are now talking to a cloud model. Boo!", loadingProgress: 100 };

  const {
    loadingMessage,
    loadingProgress,
    messages,
    append,
    reload,
    stop,
    isLoading,
    input,
    setInput,
  } = api as typeof local & { loadingMessage: string; loadingProgress: number };

  return (
    <>
      <div className={cn("pb-[200px] pt-4 md:pt-10", className)}>
        {messages.length ? (
          <>
            <ChatList messages={messages} />
            <ChatScrollAnchor trackVisibility={isLoading} />
          </>
        ) : (
          <EmptyScreen
            setInput={setInput}
            welcomeMessage={`This chat is running ${selectedModel.simpleName} in your browser!`}
          />
        )}
      </div>
      <ChatPanel
        id={id}
        isLoading={isLoading}
        stop={stop}
        append={append}
        reload={reload}
        messages={messages}
        input={input}
        setInput={setInput}
        loadingMessage={loadingMessage}
        loadingProgress={loadingProgress}
        selectedModel={selectedModel}
        localModel={USE_LOCAL_CHAT}
      />
    </>
  );
}
