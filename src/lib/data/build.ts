import { createClient } from "@/lib/supabase/server";
import type { BuildBrief, BuildProject, PrototypeVersion, BuildIssue, AtlasFile } from "@/lib/types/domain";

export async function listBuildBriefs(): Promise<BuildBrief[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("build_briefs")
    .select("*")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return data as BuildBrief[];
}

export async function getBuildBrief(id: string): Promise<BuildBrief | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("build_briefs").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data as BuildBrief | null;
}

export async function listBuildProjects(): Promise<BuildProject[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("build_projects")
    .select("*")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return data as BuildProject[];
}

export async function getBuildProject(id: string): Promise<BuildProject | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("build_projects").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data as BuildProject | null;
}

export async function listPrototypeVersions(buildProjectId: string): Promise<PrototypeVersion[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("prototype_versions")
    .select("*")
    .eq("build_project_id", buildProjectId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as PrototypeVersion[];
}

export async function listAllPrototypeVersions(): Promise<PrototypeVersion[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("prototype_versions")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as PrototypeVersion[];
}

export async function listFilesForBuildProject(buildProjectId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("record_links")
    .select("id, file:atlas_files(*)")
    .eq("build_project_id", buildProjectId)
    .not("file_id", "is", null);
  if (error) throw error;
  return data as unknown as { id: string; file: AtlasFile }[];
}

export async function listTestsForBuildProject(buildProjectId: string, versionIds: string[]) {
  if (versionIds.length === 0) return [];
  const supabase = await createClient();
  const { data, error } = await supabase.from("tests").select("*").in("prototype_version_id", versionIds);
  if (error) throw error;
  return data;
}

export async function listBuildIssues(buildProjectId: string): Promise<BuildIssue[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("build_issues")
    .select("*")
    .eq("build_project_id", buildProjectId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as BuildIssue[];
}
