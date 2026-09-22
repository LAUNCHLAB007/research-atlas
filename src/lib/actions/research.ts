"use server";

import { revalidatePath } from "next/cache";
import {
  createResearchProjectSchema,
  createHypothesisSchema,
  createExperimentPlanSchema,
  createNotebookEntrySchema,
  researchStatusSchema,
} from "@/lib/validation/schemas";
import { requireUser, linkTopics, runAction, ActionError } from "./shared";

export async function createResearchProject(input: unknown) {
  return runAction(async () => {
    const parsed = createResearchProjectSchema.safeParse(input);
    if (!parsed.success) throw new ActionError(parsed.error.issues[0]?.message ?? "Invalid project.");
    const { supabase } = await requireUser();
    const { data, error } = await supabase
      .from("research_projects")
      .insert({
        title: parsed.data.title,
        question: parsed.data.question || null,
        objective: parsed.data.objective || null,
      })
      .select()
      .single();
    if (error || !data) throw new ActionError(error?.message ?? "Could not create project.");
    await linkTopics(supabase, parsed.data.topicIds, "research_project_id", data.id);
    revalidatePath("/research");
    return data;
  });
}

export async function promoteEntryToResearch(entryId: string) {
  return runAction(async () => {
    const { supabase } = await requireUser();
    const { data: entry, error: entryError } = await supabase
      .from("entries")
      .select("*")
      .eq("id", entryId)
      .single();
    if (entryError || !entry) throw new ActionError("Could not find that entry.");

    const { data: project, error } = await supabase
      .from("research_projects")
      .insert({
        title: entry.title || entry.body.slice(0, 80),
        question: entry.kind === "question" ? entry.body : null,
      })
      .select()
      .single();
    if (error || !project) throw new ActionError(error?.message ?? "Could not create research project.");

    await supabase.from("record_links").insert({
      relationship: "derived_from",
      entry_id: entry.id,
      research_project_id: project.id,
    });

    revalidatePath("/research");
    revalidatePath(`/explore/questions/${entryId}`);
    return project;
  });
}

export async function setResearchStatus(projectId: string, status: string) {
  return runAction(async () => {
    const parsed = researchStatusSchema.safeParse(status);
    if (!parsed.success) throw new ActionError("Invalid status.");
    const { supabase } = await requireUser();
    const { error } = await supabase.from("research_projects").update({ status: parsed.data }).eq("id", projectId);
    if (error) throw new ActionError(error.message);
    revalidatePath(`/research/${projectId}/overview`);
  });
}

export async function updateResearchBackground(projectId: string, objective: string, currentFocus: string) {
  return runAction(async () => {
    const { supabase } = await requireUser();
    const { error } = await supabase
      .from("research_projects")
      .update({ objective: objective || null, current_focus: currentFocus || null })
      .eq("id", projectId);
    if (error) throw new ActionError(error.message);
    revalidatePath(`/research/${projectId}/background`);
  });
}

export async function linkSourceToProject(projectId: string, sourceId: string) {
  return runAction(async () => {
    const { supabase } = await requireUser();
    const { error } = await supabase.from("record_links").insert({
      relationship: "supports",
      research_project_id: projectId,
      source_id: sourceId,
    });
    if (error) throw new ActionError(error.message);
    revalidatePath(`/research/${projectId}/evidence`);
  });
}

export async function createHypothesis(input: unknown) {
  return runAction(async () => {
    const parsed = createHypothesisSchema.safeParse(input);
    if (!parsed.success) throw new ActionError(parsed.error.issues[0]?.message ?? "Invalid hypothesis.");
    const { supabase } = await requireUser();
    const { data, error } = await supabase
      .from("hypotheses")
      .insert({
        project_id: parsed.data.project_id,
        statement: parsed.data.statement,
        rationale: parsed.data.rationale || null,
        falsification_criteria: parsed.data.falsification_criteria || null,
      })
      .select()
      .single();
    if (error || !data) throw new ActionError(error?.message ?? "Could not save hypothesis.");
    revalidatePath(`/research/${parsed.data.project_id}/hypotheses`);
    return data;
  });
}

export async function createExperimentPlan(input: unknown) {
  return runAction(async () => {
    const parsed = createExperimentPlanSchema.safeParse(input);
    if (!parsed.success) throw new ActionError(parsed.error.issues[0]?.message ?? "Invalid experiment plan.");
    const { supabase } = await requireUser();

    if (parsed.data.hypothesis_id) {
      const { data: hyp } = await supabase
        .from("hypotheses")
        .select("id, project_id")
        .eq("id", parsed.data.hypothesis_id)
        .single();
      if (!hyp || hyp.project_id !== parsed.data.project_id) {
        throw new ActionError("The hypothesis must belong to this research project.");
      }
    }

    const { data, error } = await supabase
      .from("experiment_plans")
      .insert({
        project_id: parsed.data.project_id,
        hypothesis_id: parsed.data.hypothesis_id || null,
        title: parsed.data.title,
        objective: parsed.data.objective || null,
        model_or_material: parsed.data.model_or_material || null,
        controls: parsed.data.controls || null,
        method: parsed.data.method || null,
        measurement_plan: parsed.data.measurement_plan || null,
        analysis_plan: parsed.data.analysis_plan || null,
        resources: parsed.data.resources || null,
        safety_notes: parsed.data.safety_notes || null,
      })
      .select()
      .single();
    if (error || !data) throw new ActionError(error?.message ?? "Could not save experiment plan.");
    revalidatePath(`/research/${parsed.data.project_id}/experiment-plans`);
    return data;
  });
}

export async function createNotebookEntry(input: unknown) {
  return runAction(async () => {
    const parsed = createNotebookEntrySchema.safeParse(input);
    if (!parsed.success) throw new ActionError(parsed.error.issues[0]?.message ?? "Invalid entry.");
    const { supabase } = await requireUser();
    const { data, error } = await supabase
      .from("notebook_entries")
      .insert({
        project_id: parsed.data.project_id,
        kind: parsed.data.kind,
        body: parsed.data.body,
      })
      .select()
      .single();
    if (error || !data) throw new ActionError(error?.message ?? "Could not save entry.");
    revalidatePath(`/research/${parsed.data.project_id}/notebook`);
    return data;
  });
}
