"use server";

import { revalidatePath } from "next/cache";
import {
  createBuildBriefSchema,
  createBuildProjectSchema,
  createPrototypeVersionSchema,
  createBuildIssueSchema,
} from "@/lib/validation/schemas";
import { requireUser, runAction, ActionError } from "./shared";

export async function createBuildBrief(input: unknown) {
  return runAction(async () => {
    const parsed = createBuildBriefSchema.safeParse(input);
    if (!parsed.success) throw new ActionError(parsed.error.issues[0]?.message ?? "Invalid build brief.");
    const { supabase } = await requireUser();
    const { data, error } = await supabase
      .from("build_briefs")
      .insert({
        title: parsed.data.title,
        problem_statement: parsed.data.problem_statement || null,
        existing_approaches: parsed.data.existing_approaches || null,
        proposed_contribution: parsed.data.proposed_contribution || null,
        required_knowledge: parsed.data.required_knowledge || null,
        available_resources: parsed.data.available_resources || null,
        prototype_scope: parsed.data.prototype_scope || null,
        success_criteria: parsed.data.success_criteria || null,
        first_test_plan: parsed.data.first_test_plan || null,
      })
      .select()
      .single();
    if (error || !data) throw new ActionError(error?.message ?? "Could not save build brief.");
    revalidatePath("/build");
    return data;
  });
}

export async function linkFileToBuildProject(buildProjectId: string, fileId: string) {
  return runAction(async () => {
    const { supabase } = await requireUser();
    const { error } = await supabase.from("record_links").insert({
      relationship: "documents",
      build_project_id: buildProjectId,
      file_id: fileId,
    });
    if (error) throw new ActionError(error.message);
    revalidatePath(`/build/${buildProjectId}/workspace`);
  });
}

export async function setBuildProjectStatus(buildProjectId: string, status: string) {
  return runAction(async () => {
    const { supabase } = await requireUser();
    const { error } = await supabase.from("build_projects").update({ status }).eq("id", buildProjectId);
    if (error) throw new ActionError(error.message);
    revalidatePath(`/build/${buildProjectId}/overview`);
  });
}

export async function createBuildProject(input: unknown) {
  return runAction(async () => {
    const parsed = createBuildProjectSchema.safeParse(input);
    if (!parsed.success) throw new ActionError(parsed.error.issues[0]?.message ?? "Invalid build project.");
    const { supabase } = await requireUser();
    const { data, error } = await supabase
      .from("build_projects")
      .insert({
        brief_id: parsed.data.brief_id || null,
        research_project_id: parsed.data.research_project_id || null,
        title: parsed.data.title,
        kind: parsed.data.kind,
        purpose: parsed.data.purpose || null,
        success_criteria: parsed.data.success_criteria || null,
      })
      .select()
      .single();
    if (error || !data) throw new ActionError(error?.message ?? "Could not create build project.");
    revalidatePath("/build");
    return data;
  });
}

export async function createPrototypeVersion(input: unknown) {
  return runAction(async () => {
    const parsed = createPrototypeVersionSchema.safeParse(input);
    if (!parsed.success) throw new ActionError(parsed.error.issues[0]?.message ?? "Invalid prototype version.");
    const { supabase } = await requireUser();
    const { data, error } = await supabase
      .from("prototype_versions")
      .insert({
        build_project_id: parsed.data.build_project_id,
        version_label: parsed.data.version_label,
        design_notes: parsed.data.design_notes || null,
        change_summary: parsed.data.change_summary || null,
      })
      .select()
      .single();
    if (error || !data) {
      const message = error?.message.includes("unique")
        ? "That version label already exists on this project."
        : error?.message ?? "Could not create prototype version.";
      throw new ActionError(message);
    }
    revalidatePath(`/build/${parsed.data.build_project_id}/versions`);
    return data;
  });
}

export async function createBuildIssue(input: unknown) {
  return runAction(async () => {
    const parsed = createBuildIssueSchema.safeParse(input);
    if (!parsed.success) throw new ActionError(parsed.error.issues[0]?.message ?? "Invalid issue.");
    const { supabase } = await requireUser();

    if (parsed.data.prototype_version_id) {
      const { data: version } = await supabase
        .from("prototype_versions")
        .select("id, build_project_id")
        .eq("id", parsed.data.prototype_version_id)
        .single();
      if (!version || version.build_project_id !== parsed.data.build_project_id) {
        throw new ActionError("The prototype version must belong to this build project.");
      }
    }

    const { data, error } = await supabase
      .from("build_issues")
      .insert({
        build_project_id: parsed.data.build_project_id,
        prototype_version_id: parsed.data.prototype_version_id || null,
        title: parsed.data.title,
        observation: parsed.data.observation || null,
        attempted_fixes: parsed.data.attempted_fixes || null,
      })
      .select()
      .single();
    if (error || !data) throw new ActionError(error?.message ?? "Could not save issue.");
    revalidatePath(`/build/${parsed.data.build_project_id}/problems`);
    return data;
  });
}
