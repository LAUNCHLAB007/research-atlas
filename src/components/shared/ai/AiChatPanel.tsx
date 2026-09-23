"use client";

import { useEffect, useRef, useState } from "react";
import { parseExploreResponse, type SuggestedTopic, type SourceRef } from "@/lib/ai/explore";
import { ProvenanceBadge } from "@/components/shared/ProvenanceBadge";
import { MarkdownMessage } from "./MarkdownMessage";
import { TopicSuggestionCard } from "./TopicSuggestionCard";
import type { AiMessage } from "@/lib/types/domain";
import type { ActionResult } from "@/lib/actions/shared";

interface DisplayMessage {
  id: string;
  role: "user" | "assistant";
  body: string;
  sources: SourceRef[];
}

function toDisplayMessages(messages: AiMessage[]): DisplayMessage[] {
  return messages
    .filter((m) => m.role !== "system_note")
    .map((m) => {
      if (m.role === "assistant") {
        const { body, sources } = parseExploreResponse(m.body);
        return { id: m.id, role: "assistant" as const, body, sources };
      }
      return { id: m.id, role: "user" as const, body: m.body, sources: [] };
    });
}

function dedupeTopics(topics: SuggestedTopic[]): SuggestedTopic[] {
  const seen = new Set<string>();
  const result: SuggestedTopic[] = [];
  for (const t of topics) {
    const key = t.label.trim().toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(t);
  }
  return result;
}

export interface AiChatReply {
  sessionId: string;
  body: string;
  topics: SuggestedTopic[];
  sources: SourceRef[];
}

export function AiChatPanel({
  title,
  subtitle,
  placeholder,
  emptyStateText,
  suggestionsLabel,
  initialMessages,
  onSend,
  autoStartMessage,
}: {
  title: string;
  subtitle: string;
  placeholder: string;
  emptyStateText: string;
  suggestionsLabel: string;
  initialMessages: AiMessage[];
  onSend: (text: string) => Promise<ActionResult<AiChatReply>>;
  // If there's no history yet, send this on mount instead of waiting for the user to type a kickoff
  // message themselves — useful for modes like Research critic where "critique this" is implied by
  // opening the panel at all.
  autoStartMessage?: string;
}) {
  const [messages, setMessages] = useState<DisplayMessage[]>(toDisplayMessages(initialMessages));
  const [topics, setTopics] = useState<SuggestedTopic[]>(() =>
    dedupeTopics(
      initialMessages
        .filter((m) => m.role === "assistant")
        .flatMap((m) => parseExploreResponse(m.body).topics)
    )
  );
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const autoStarted = useRef(false);

  async function sendText(text: string, showUserBubble: boolean) {
    setError(null);
    if (showUserBubble) {
      setMessages((prev) => [...prev, { id: `local-${Date.now()}`, role: "user", body: text, sources: [] }]);
    }
    setSending(true);

    const result = await onSend(text);
    setSending(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }
    setMessages((prev) => [
      ...prev,
      { id: `assistant-${Date.now()}`, role: "assistant", body: result.data.body, sources: result.data.sources },
    ]);
    if (result.data.topics.length > 0) {
      setTopics((prev) => dedupeTopics([...prev, ...result.data.topics]));
    }
  }

  useEffect(() => {
    if (autoStartMessage && messages.length === 0 && !autoStarted.current) {
      autoStarted.current = true;
      void sendText(autoStartMessage, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || sending) return;
    const text = input;
    setInput("");
    await sendText(text, true);
  }

  return (
    <div className="flex h-full flex-col rounded-[var(--radius-card)] border border-border bg-panel">
      <div className="border-b border-border px-4 py-3">
        <h2 className="text-sm font-medium text-text-primary">{title}</h2>
        <p className="text-xs text-text-secondary">{subtitle}</p>
      </div>

      {topics.length > 0 && (
        <div className="border-b border-border bg-inset/50 px-4 py-3">
          <p className="mb-2 text-xs font-medium text-text-secondary">{suggestionsLabel}</p>
          <div className="space-y-1.5">
            {topics.map((t, i) => (
              <TopicSuggestionCard key={`${t.label}-${i}`} topic={t} />
            ))}
          </div>
        </div>
      )}

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
        {messages.length === 0 && <p className="text-sm text-text-secondary">{emptyStateText}</p>}
        {messages.map((m) => (
          <div key={m.id} className={m.role === "user" ? "ml-6" : "mr-2"}>
            <div className="mb-1 flex items-center gap-2">
              {m.role === "assistant" ? (
                <ProvenanceBadge provenance="ai_suggestion" />
              ) : (
                <span className="text-xs font-medium text-text-secondary">You</span>
              )}
            </div>
            {m.role === "user" ? (
              <div className="rounded-lg bg-accent-selected px-3 py-2 text-sm text-text-primary">{m.body}</div>
            ) : (
              <div className="rounded-lg bg-inset px-3 py-2 text-sm text-text-primary">
                <MarkdownMessage text={m.body} />
                {m.sources.length > 0 ? (
                  <div className="mt-2 border-t border-border/60 pt-2">
                    <p className="text-xs font-medium text-text-secondary">Sources found via web search</p>
                    <ul className="mt-1 space-y-0.5">
                      {m.sources.map((s) => (
                        <li key={s.url}>
                          <a
                            href={s.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-accent hover:underline"
                          >
                            {s.title}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="mt-2 border-t border-border/60 pt-2 text-xs italic text-text-secondary">
                    Not checked against a live source — verify before relying on this.
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
        {sending && <p className="text-xs text-text-secondary">Thinking…</p>}
        {error && <p className="text-sm text-error">{error}</p>}
      </div>

      <form onSubmit={submit} className="flex gap-2 border-t border-border p-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
          className="flex-1 rounded-lg border border-border bg-canvas px-3 py-2 text-sm outline-none focus:border-accent"
        />
        <button
          type="submit"
          disabled={sending || !input.trim()}
          className="rounded-lg bg-accent px-3 py-2 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}
