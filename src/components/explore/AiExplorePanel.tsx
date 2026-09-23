"use client";

import { sendExploreMessage } from "@/lib/actions/ai";
import { AiChatPanel } from "@/components/shared/ai/AiChatPanel";
import type { AiMessage } from "@/lib/types/domain";

export function AiExplorePanel({ entryId, initialMessages }: { entryId: string; initialMessages: AiMessage[] }) {
  return (
    <AiChatPanel
      title="Explore with me"
      subtitle="AI-generated. Draft until you save it elsewhere."
      placeholder="Ask a follow-up question…"
      emptyStateText="Ask a follow-up, request alternative explanations, or ask what's still unknown about this."
      suggestionsLabel="Suggested from this conversation"
      initialMessages={initialMessages}
      onSend={(text) => sendExploreMessage(entryId, text)}
    />
  );
}
