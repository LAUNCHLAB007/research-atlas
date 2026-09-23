"use server";

import { revalidatePath } from "next/cache";
import { buildResearchCriticSystemPrompt, critiqueOpeningGuidance, type CritiqueSubjectType } from "@/lib/ai/researchCritic";
import { appendSourcesMarker, parseExploreResponse } from "@/lib/ai/explore";
import { runCachedChatTurn } from "@/lib/ai/chatRequest";
import { requireUser, runAction, ActionError, toActionError } from "./shared";
import { getSessionForContext, listMessages } from "@/lib/data/ai";
import { getHypothesis, getExperimentPlan } from "@/lib/data/research";
import type { AiSession } from "@/lib/types/domain";

export type CritiqueSubjectKind = "hypothesis" | "experiment_plan";

async function loadSubject(kind: CritiqueSubjectKind, subjectId: string) {
  if (kind === "hypothesis") {
    const h = await getHypothesis(subjectId);
    if (!h) throw new ActionError("Could not find that hypothesis.");
    const parts = [h.statement];
    if (h.rationale) parts.push(`Rationale: ${h.rationale}`);
    if (h.falsification_criteria) parts.push(`Falsified if: ${h.falsification_criteria}`);
    return { text: parts.join(" — "), projectId: h.project_id, label: "hypothesis" as CritiqueSubjectType };
  }
  const p = await getExperimentPlan(subjectId);
  if (!p) throw new ActionError("Could not find that experiment plan.");
  const parts = [p.title];
  if (p.method) parts.push(`Method: ${p.method}`);
  if (p.controls) parts.push(`Controls: ${p.controls}`);
  if (p.measurement_plan) parts.push(`Measurement: ${p.measurement_plan}`);
  return { text: parts.join(" — "), projectId: p.project_id, label: "experiment plan" as CritiqueSubjectType };
}

export async function sendCritiqueMessage(kind: CritiqueSubjectKind, subjectId: string, userText: string) {
  return runAction(async () => {
    if (!userText.trim()) throw new ActionError("Write a message before sending.");
    const { supabase } = await requireUser();

    const subject = await loadSubject(kind, subjectId);
    const contextKey = kind === "hypothesis" ? "hypothesis_id" : "experiment_plan_id";

    let session = await getSessionForContext("research_critic", { [contextKey]: subjectId });
    if (!session) {
      const { data, error } = await supabase
        .from("ai_sessions")
        .insert({ mode: "research_critic", title: subject.text.slice(0, 60), context: { [contextKey]: subjectId } })
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
        label: "research-critic",
        systemPrompt: buildResearchCriticSystemPrompt(subject.label, subject.text),
        dynamicGuidance: critiqueOpeningGuidance(priorMessages.length),
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

    revalidatePath(`/research/${subject.projectId}/${kind === "hypothesis" ? "hypotheses" : "experiment-plans"}`);

    const { body, topics } = parseExploreResponse(rawText);
    return { sessionId: session!.id, body, topics, sources };
  });
}

export async function getCritiqueMessages(kind: CritiqueSubjectKind, subjectId: string) {
  const contextKey = kind === "hypothesis" ? "hypothesis_id" : "experiment_plan_id";
  const session = await getSessionForContext("research_critic", { [contextKey]: subjectId });
  if (!session) return [];
  return listMessages(session.id);
}
