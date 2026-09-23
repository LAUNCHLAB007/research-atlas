"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { sendExploreMessage, addSuggestedTopicToClassroom, addSuggestedTopicToLibrary } from "@/lib/actions/ai";
import { parseExploreResponse, type SuggestedTopic, type SourceRef } from "@/lib/ai/explore";
import { ProvenanceBadge } from "@/components/shared/ProvenanceBadge";
import type { AiMessage } from "@/lib/types/domain";

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

export function AiExplorePanel({ entryId, initialMessages }: { entryId: string; initialMessages: AiMessage[] }) {
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

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || sending) return;
    const text = input;
    setInput("");
    setError(null);
    setMessages((prev) => [...prev, { id: `local-${Date.now()}`, role: "user", body: text, sources: [] }]);
    setSending(true);

    const result = await sendExploreMessage(entryId, text);
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

  return (
    <div className="flex h-full flex-col rounded-[var(--radius-card)] border border-border bg-panel">
      <div className="border-b border-border px-4 py-3">
        <h2 className="text-sm font-medium text-text-primary">Explore with me</h2>
        <p className="text-xs text-text-secondary">AI-generated. Draft until you save it elsewhere.</p>
      </div>

      {topics.length > 0 && (
        <div className="border-b border-border bg-inset/50 px-4 py-3">
          <p className="mb-2 text-xs font-medium text-text-secondary">Suggested from this conversation</p>
          <div className="space-y-1.5">
            {topics.map((t, i) => (
              <TopicSuggestion key={`${t.label}-${i}`} topic={t} />
            ))}
          </div>
        </div>
      )}

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
        {messages.length === 0 && (
          <p className="text-sm text-text-secondary">
            Ask a follow-up, request alternative explanations, or ask what&apos;s still unknown about this.
          </p>
        )}
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
          placeholder="Ask a follow-up question…"
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

function MarkdownMessage({ text }: { text: string }) {
  return (
    <div className="space-y-2 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
      <ReactMarkdown
        components={{
          p: ({ children }) => <p className="leading-relaxed">{children}</p>,
          strong: ({ children }) => <strong className="font-semibold text-text-primary">{children}</strong>,
          em: ({ children }) => <em className="italic">{children}</em>,
          ul: ({ children }) => <ul className="list-disc space-y-1 pl-5">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal space-y-1 pl-5">{children}</ol>,
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          code: ({ children }) => <code className="rounded bg-canvas px-1 py-0.5 text-xs">{children}</code>,
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noreferrer" className="text-accent hover:underline">
              {children}
            </a>
          ),
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}

function TopicSuggestion({ topic }: { topic: SuggestedTopic }) {
  const [status, setStatus] = useState<"idle" | "saving" | "classroom" | "library">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handle(kind: "classroom" | "library") {
    setStatus("saving");
    setError(null);
    const result = kind === "classroom" ? await addSuggestedTopicToClassroom(topic) : await addSuggestedTopicToLibrary(topic);
    if (!result.ok) {
      setError(result.error);
      setStatus("idle");
      return;
    }
    setStatus(kind);
  }

  return (
    <div className="rounded-lg border border-dashed border-border bg-panel p-2.5">
      <p className="text-sm font-medium text-text-primary">{topic.label}</p>
      <p className="text-xs text-text-secondary">{topic.description}</p>
      {status === "idle" || status === "saving" ? (
        <div className="mt-1.5 flex gap-2">
          <button
            type="button"
            disabled={status === "saving"}
            onClick={() => handle("classroom")}
            className="rounded-full border border-border px-2.5 py-1 text-xs font-medium text-text-secondary hover:border-accent hover:text-accent disabled:opacity-50"
          >
            + Classroom
          </button>
          <button
            type="button"
            disabled={status === "saving"}
            onClick={() => handle("library")}
            className="rounded-full border border-border px-2.5 py-1 text-xs font-medium text-text-secondary hover:border-accent hover:text-accent disabled:opacity-50"
          >
            + Library
          </button>
        </div>
      ) : (
        <p className="mt-1.5 text-xs text-success">Added to {status === "classroom" ? "Classroom" : "Library"}.</p>
      )}
      {error && <p className="mt-1 text-xs text-error">{error}</p>}
    </div>
  );
}
