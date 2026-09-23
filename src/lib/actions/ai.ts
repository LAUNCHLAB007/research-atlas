"use server";

import { revalidatePath } from "next/cache";
import Anthropic from "@anthropic-ai/sdk";
import { anthropic, EXPLORE_MODEL } from "@/lib/ai/client";
import { buildExploreSystemPrompt, parseExploreResponse, type SuggestedTopic } from "@/lib/ai/explore";
import { buildSuggestQuestionsPrompt, parseQuestionsResponse, levelFromEntryCount } from "@/lib/ai/suggestQuestions";
import { requireUser, runAction, ActionError } from "./shared";
import { getExploreSessionForEntry, listMessages } from "@/lib/data/ai";
import { getEntry } from "@/lib/data/entries";
import { ensureRootTopic } from "./explore";
import { domainById } from "@/lib/constants/domains";
import { countEntriesInDomain } from "@/lib/data/topics";
import type { AiSession, LearningDomainId } from "@/lib/types/domain";

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

    const history: Anthropic.MessageParam[] = [
      ...priorMessages.map((m) => ({
        role: m.role === "assistant" ? ("assistant" as const) : ("user" as const),
        content: m.body,
      })),
      { role: "user", content: userText },
    ];

    let response;
    try {
      response = await anthropic.messages.create({
        model: EXPLORE_MODEL,
        max_tokens: 4096,
        output_config: { effort: "medium" },
        system: buildExploreSystemPrompt(entry.original_body, priorMessages.length),
        messages: history,
      });
    } catch (err) {
      throw toActionError(err);
    }

    const rawText = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n");

    const { data: assistantRow, error: assistantInsertError } = await supabase
      .from("ai_messages")
      .insert({ session_id: session!.id, role: "assistant", body: rawText })
      .select()
      .single();
    if (assistantInsertError || !assistantRow) {
      throw new ActionError(assistantInsertError?.message ?? "Could not save the AI reply.");
    }

    revalidatePath(`/explore/questions/${entryId}`);

    const { body, topics } = parseExploreResponse(rawText);
    return { sessionId: session!.id, body, topics };
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
