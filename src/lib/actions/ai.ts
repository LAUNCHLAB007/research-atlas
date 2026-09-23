"use server";

import { revalidatePath } from "next/cache";
import Anthropic from "@anthropic-ai/sdk";
import { anthropic, EXPLORE_MODEL } from "@/lib/ai/client";
import { buildExploreSystemPrompt, depthGuidance, parseExploreResponse, appendSourcesMarker } from "@/lib/ai/explore";
import { buildSuggestQuestionsPrompt, parseQuestionsResponse, levelFromEntryCount } from "@/lib/ai/suggestQuestions";
import { runCachedChatTurn, logUsage } from "@/lib/ai/chatRequest";
import { requireUser, runAction, ActionError, toActionError } from "./shared";
import { getExploreSessionForEntry, listMessages } from "@/lib/data/ai";
import { getEntry } from "@/lib/data/entries";
import { ensureRootTopic } from "./explore";
import { domainById } from "@/lib/constants/domains";
import { countEntriesInDomain } from "@/lib/data/topics";
import type { AiSession, LearningDomainId } from "@/lib/types/domain";

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

    let rawText: string;
    let sources;
    try {
      ({ rawText, sources } = await runCachedChatTurn({
        label: "explore",
        systemPrompt: buildExploreSystemPrompt(entry.original_body),
        dynamicGuidance: depthGuidance(priorMessages.length),
        priorMessages,
        userText,
      }));
    } catch (err) {
      throw toActionError(err);
    }
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

    const { body } = parseExploreResponse(rawText);
    return { sessionId: session!.id, body, sources };
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
