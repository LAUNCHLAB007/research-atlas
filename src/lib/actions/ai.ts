"use server";

import { revalidatePath } from "next/cache";
import Anthropic from "@anthropic-ai/sdk";
import { anthropic, EXPLORE_MODEL } from "@/lib/ai/client";
import {
  buildExploreSystemPrompt,
  depthGuidance,
  parseExploreResponse,
  appendSourcesMarker,
  type SuggestedTopic,
  type SourceRef,
} from "@/lib/ai/explore";
import { buildSuggestQuestionsPrompt, parseQuestionsResponse, levelFromEntryCount } from "@/lib/ai/suggestQuestions";
import { requireUser, runAction, ActionError } from "./shared";
import { getExploreSessionForEntry, listMessages } from "@/lib/data/ai";
import { getEntry } from "@/lib/data/entries";
import { ensureRootTopic } from "./explore";
import { domainById } from "@/lib/constants/domains";
import { countEntriesInDomain } from "@/lib/data/topics";
import type { AiSession, LearningDomainId } from "@/lib/types/domain";

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
function logUsage(label: string, usage: Anthropic.Usage) {
  console.log(`[ai:${label}]`, {
    input: usage.input_tokens,
    cache_read: usage.cache_read_input_tokens ?? 0,
    cache_write: usage.cache_creation_input_tokens ?? 0,
    output: usage.output_tokens,
  });
}

function toActionError(err: unknown): ActionError {
  if (err instanceof Anthropic.AuthenticationError) {
    return new ActionError("The AI is not configured yet (missing or invalid ANTHROPIC_API_KEY).");
  }
  if (err instanceof Anthropic.RateLimitError) {
    return new ActionError("The AI is rate-limited right now — try again in a moment.");
  }
  return new ActionError(err instanceof Error ? err.message : "The AI request failed.");
}

export async function sendExploreMessage(entryId: string, userText: string) {
  return runAction(async () => {
    if (!userText.trim()) throw new ActionError("Write a message before sending.");
    const { supabase } = await requireUser();

    const entry = await getEntry(entryId);
    if (!entry) throw new ActionError("Could not find that entry.");

    let session = await getExploreSessionForEntry(entryId);
    if (!session) {
      const { data, error } = await supabase
        .from("ai_sessions")
        .insert({ mode: "explore", title: entry.title || entry.body.slice(0, 60), context: { entry_id: entryId } })
        .select()
        .single();
      if (error || !data) throw new ActionError(error?.message ?? "Could not start an AI session.");
      session = data as AiSession;
    }

    const priorMessages = await listMessages(session!.id);

    const { error: userInsertError } = await supabase
      .from("ai_messages")
      .insert({ session_id: session!.id, role: "user", body: userText });
    if (userInsertError) throw new ActionError(userInsertError.message);

    // Prior turns as plain text, oldest first — byte-identical to what was sent last request, so this
    // whole prefix can be served from cache instead of reprocessed. A cache_control breakpoint on the
    // last one caches everything up to and including it (cheaper AND faster on turn 2+ of every
    // conversation — without this, a 10-turn chat reprocesses turn 1's tokens roughly 10 times over).
    const priorTurns: Anthropic.MessageParam[] = priorMessages.map((m) => ({
      role: m.role === "assistant" ? ("assistant" as const) : ("user" as const),
      content: m.body,
    }));
    if (priorTurns.length > 0) {
      const last = priorTurns[priorTurns.length - 1];
      last.content = [{ type: "text", text: last.content as string, cache_control: { type: "ephemeral", ttl: "1h" } }];
    }

    // The turn-dependent coaching (depthGuidance) is sent as a mid-conversation system message instead
    // of inside the cached system prompt — it changes every few turns, and anything that changes would
    // invalidate the cache above. It's derived fresh each request, never stored in ai_messages.
    const history: Anthropic.MessageParam[] = [
      ...priorTurns,
      { role: "user", content: userText },
      { role: "system", content: depthGuidance(priorMessages.length) } as Anthropic.MessageParam,
    ];

    let response;
    try {
      response = await anthropic.messages.create({
        model: EXPLORE_MODEL,
        max_tokens: 4096,
        output_config: { effort: "medium" },
        system: [
          {
            type: "text",
            text: buildExploreSystemPrompt(entry.original_body),
            cache_control: { type: "ephemeral", ttl: "1h" },
          },
        ],
        messages: history,
        tools: [{ type: "web_search_20260209", name: "web_search", max_uses: 5 }],
      });
    } catch (err) {
      throw toActionError(err);
    }

    logUsage("explore", response.usage);

    const rawText = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n");
    const sources = extractWebSources(response.content);
    const storedText = appendSourcesMarker(rawText, sources);

    const { data: assistantRow, error: assistantInsertError } = await supabase
      .from("ai_messages")
      .insert({ session_id: session!.id, role: "assistant", body: storedText })
      .select()
      .single();
    if (assistantInsertError || !assistantRow) {
      throw new ActionError(assistantInsertError?.message ?? "Could not save the AI reply.");
    }

    revalidatePath(`/explore/questions/${entryId}`);

    const { body, topics } = parseExploreResponse(rawText);
    return { sessionId: session!.id, body, topics, sources };
  });
}

export async function addSuggestedTopicToClassroom(topic: SuggestedTopic) {
  return runAction(async () => {
    const { supabase } = await requireUser();
    const { data, error } = await supabase
      .from("classrooms")
      .insert({ title: topic.label, learning_goal: topic.description })
      .select()
      .single();
    if (error || !data) throw new ActionError(error?.message ?? "Could not add to Classroom.");
    revalidatePath("/classroom");
    return data;
  });
}

export async function suggestDomainQuestions(domainId: LearningDomainId) {
  return runAction(async () => {
    await requireUser();
    const domain = domainById(domainId);
    const entryCount = await countEntriesInDomain(domainId);
    const level = levelFromEntryCount(entryCount);

    let response;
    try {
      response = await anthropic.messages.create({
        model: EXPLORE_MODEL,
        max_tokens: 1024,
        output_config: { effort: "medium" },
        messages: [{ role: "user", content: buildSuggestQuestionsPrompt(domain.name, domain.description, level) }],
      });
    } catch (err) {
      throw toActionError(err);
    }
    logUsage("suggest-questions", response.usage);

    const rawText = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n");

    const questions = parseQuestionsResponse(rawText);
    if (questions.length === 0) throw new ActionError("Could not generate suggestions — try again.");
    return { questions, level };
  });
}

export async function saveAndExploreQuestion(questionText: string, domainId: LearningDomainId) {
  return runAction(async () => {
    const { supabase } = await requireUser();
    const rootTopic = await ensureRootTopic(domainId, domainById(domainId).name);

    const { data: entry, error } = await supabase
      .from("entries")
      .insert({ kind: "question", body: questionText, original_body: questionText })
      .select()
      .single();
    if (error || !entry) throw new ActionError(error?.message ?? "Could not save the question.");

    await supabase.from("topic_links").insert({ topic_id: rootTopic.id, entry_id: entry.id });

    revalidatePath("/explore");
    return entry;
  });
}

export async function addSuggestedTopicToLibrary(topic: SuggestedTopic) {
  return runAction(async () => {
    const { supabase } = await requireUser();
    const { data, error } = await supabase
      .from("sources")
      .insert({ kind: "other", title: topic.label, notes: topic.description })
      .select()
      .single();
    if (error || !data) throw new ActionError(error?.message ?? "Could not add to Library.");
    revalidatePath("/library");
    return data;
  });
}
