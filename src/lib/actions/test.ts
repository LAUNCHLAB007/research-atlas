"use server";

import { revalidatePath } from "next/cache";
import { createTestSchema, recordTestResultSchema } from "@/lib/validation/schemas";
import { requireUser, runAction, ActionError } from "./shared";

export async function createTest(input: unknown) {
  return runAction(async () => {
    const parsed = createTestSchema.safeParse(input);
    if (!parsed.success) throw new ActionError(parsed.error.issues[0]?.message ?? "Invalid test.");
    const { supabase } = await requireUser();
    const { data, error } = await supabase
      .from("tests")
      .insert({
        title: parsed.data.title,
        research_project_id: parsed.data.research_project_id || null,
        experiment_plan_id: parsed.data.experiment_plan_id || null,
        prototype_version_id: parsed.data.prototype_version_id || null,
        objective: parsed.data.objective || null,
        method: parsed.data.method || null,
        success_criteria: parsed.data.success_criteria || null,
      })
      .select()
      .single();
    if (error || !data) throw new ActionError(error?.message ?? "Could not create test.");
    revalidatePath("/test");
    return data;
  });
}

export async function markTestPerformed(testId: string) {
  return runAction(async () => {
    const { supabase } = await requireUser();
    const { error } = await supabase
      .from("tests")
      .update({ status: "performed", performed_at: new Date().toISOString() })
      .eq("id", testId);
    if (error) throw new ActionError(error.message);
    revalidatePath(`/test/${testId}`);
  });
}

export async function setTestStatus(testId: string, status: string) {
  return runAction(async () => {
    const { supabase } = await requireUser();
    const { error } = await supabase.from("tests").update({ status }).eq("id", testId);
    if (error) throw new ActionError(error.message);
    revalidatePath(`/test/${testId}`);
  });
}

export async function recordTestResult(input: unknown) {
  return runAction(async () => {
    const parsed = recordTestResultSchema.safeParse(input);
    if (!parsed.success) throw new ActionError(parsed.error.issues[0]?.message ?? "Invalid result.");
    const { supabase } = await requireUser();

    const { data: test } = await supabase
      .from("tests")
      .select("status, performed_at")
      .eq("id", parsed.data.test_id)
      .single();
    if (!test || !["performed", "analyzed"].includes(test.status) || !test.performed_at) {
      throw new ActionError("Mark the test as performed, with a performed date, before recording a result.");
    }

    const { data, error } = await supabase
      .from("test_results")
      .insert({
        test_id: parsed.data.test_id,
        observations: parsed.data.observations || null,
        analysis: parsed.data.analysis || null,
        conclusion: parsed.data.conclusion || null,
        limitations: parsed.data.limitations || null,
      })
      .select()
      .single();
    if (error || !data) throw new ActionError(error?.message ?? "Could not save result.");

    await supabase.from("tests").update({ status: "analyzed" }).eq("id", parsed.data.test_id);
    revalidatePath(`/test/${parsed.data.test_id}`);
    return data;
  });
}
