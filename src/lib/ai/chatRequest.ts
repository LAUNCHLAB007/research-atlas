import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { anthropic, EXPLORE_MODEL } from "./client";
import type { SourceRef } from "./chatShared";
import type { AiMessage } from "@/lib/types/domain";

function extractWebSources(content: Anthropic.ContentBlock[]): SourceRef[] {
  const sources: SourceRef[] = [];
  for (const block of content) {
    if (block.type !== "web_search_tool_result") continue;
    const result = block.content;
    if (!Array.isArray(result)) continue; // an error object, not results
    for (const item of result) {
      if (item.type === "web_search_result") {
        sources.push({ title: item.title, url: item.url });
      }
    }
  }
  const seen = new Set<string>();
  return sources.filter((s) => (seen.has(s.url) ? false : (seen.add(s.url), true)));
}

// Visible in Vercel's function logs (Project > Logs). No Admin API key is configured for this project,
// so this is the cheapest way to see the real cache hit rate and token split per call.
export function logUsage(label: string, usage: Anthropic.Usage) {
  console.log(`[ai:${label}]`, {
    input: usage.input_tokens,
    cache_read: usage.cache_read_input_tokens ?? 0,
    cache_write: usage.cache_creation_input_tokens ?? 0,
    output: usage.output_tokens,
  });
}

export interface CachedChatTurnResult {
  rawText: string;
  sources: SourceRef[];
}

// Shared by every conversational AI mode (Explore, Research critic, ...). Handles prompt caching (the
// prior-turns prefix is cached so a long conversation doesn't reprocess itself from scratch every turn),
// web search, and usage logging identically across modes — see the cost-optimization commit for why
// this shape exists (mid-conversation system message so dynamic guidance doesn't bust the cache).
export async function runCachedChatTurn(params: {
  label: string;
  systemPrompt: string;
  dynamicGuidance: string;
  priorMessages: AiMessage[];
  userText: string;
  maxTokens?: number;
}): Promise<CachedChatTurnResult> {
  const priorTurns: Anthropic.MessageParam[] = params.priorMessages.map((m) => ({
    role: m.role === "assistant" ? ("assistant" as const) : ("user" as const),
    content: m.body,
  }));
  if (priorTurns.length > 0) {
    const last = priorTurns[priorTurns.length - 1];
    last.content = [{ type: "text", text: last.content as string, cache_control: { type: "ephemeral", ttl: "1h" } }];
  }

  const messages: Anthropic.MessageParam[] = [
    ...priorTurns,
    { role: "user", content: params.userText },
    { role: "system", content: params.dynamicGuidance } as Anthropic.MessageParam,
  ];

  const response = await anthropic.messages.create({
    model: EXPLORE_MODEL,
    max_tokens: params.maxTokens ?? 4096,
    output_config: { effort: "medium" },
    system: [{ type: "text", text: params.systemPrompt, cache_control: { type: "ephemeral", ttl: "1h" } }],
    messages,
    tools: [{ type: "web_search_20260209", name: "web_search", max_uses: 5 }],
  });

  logUsage(params.label, response.usage);

  const rawText = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n");

  return { rawText, sources: extractWebSources(response.content) };
}
