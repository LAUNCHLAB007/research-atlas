import { createClient } from "@/lib/supabase/server";
import type {
  ResearchProject,
  Hypothesis,
  ExperimentPlan,
  NotebookEntry,
  Test,
  TestResult,
  Source,
} from "@/lib/types/domain";

export async function listResearchProjects(): Promise<ResearchProject[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("research_projects")
    .select("*")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return data as ResearchProject[];
}

export async function getResearchProject(id: string): Promise<ResearchProject | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("research_projects").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data as ResearchProject | null;
}

export async function listHypotheses(projectId: string): Promise<Hypothesis[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("hypotheses")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as Hypothesis[];
}

export async function getHypothesis(id: string): Promise<Hypothesis | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("hypotheses").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data as Hypothesis | null;
}

export async function getExperimentPlan(id: string): Promise<ExperimentPlan | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("experiment_plans").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data as ExperimentPlan | null;
}

export async function listExperimentPlans(projectId: string): Promise<ExperimentPlan[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("experiment_plans")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as ExperimentPlan[];
}

export async function listNotebookEntries(projectId: string): Promise<NotebookEntry[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("notebook_entries")
    .select("*")
    .eq("project_id", projectId)
    .order("recorded_at", { ascending: false });
  if (error) throw error;
  return data as NotebookEntry[];
}

export async function listAllExperimentPlans(): Promise<ExperimentPlan[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("experiment_plans")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as ExperimentPlan[];
}

export async function listEvidenceForProject(projectId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("record_links")
    .select("id, source:sources(*)")
    .eq("research_project_id", projectId)
    .not("source_id", "is", null);
  if (error) throw error;
  return data as unknown as { id: string; source: Source }[];
}

export type TestWithResults = Test & { test_results: TestResult[] };

export async function listResultsForProject(projectId: string): Promise<TestWithResults[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tests")
    .select("*, test_results(*)")
    .eq("research_project_id", projectId)
    .order("performed_at", { ascending: false });
  if (error) throw error;
  return data as unknown as TestWithResults[];
}
