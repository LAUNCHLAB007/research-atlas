import { createClient } from "@/lib/supabase/server";
import type { Topic } from "@/lib/types/domain";

export async function listTopics(): Promise<Topic[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("topics").select("*").order("name");
  if (error) throw error;
  return data as Topic[];
}

export async function listTopicsByDomain(domainId: number): Promise<Topic[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("topics")
    .select("*")
    .eq("domain_id", domainId)
    .order("name");
  if (error) throw error;
  return data as Topic[];
}

export async function getTopic(id: string): Promise<Topic | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("topics").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data as Topic | null;
}

export async function listSubtopics(parentId: string): Promise<Topic[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("topics").select("*").eq("parent_id", parentId).order("name");
  if (error) throw error;
  return data as Topic[];
}

export interface TopicLinkRow {
  id: string;
  topic_id: string;
  entry_id: string | null;
  source_id: string | null;
  concept_id: string | null;
  research_project_id: string | null;
  build_project_id: string | null;
}

export async function listTopicLinksForTopic(topicId: string): Promise<TopicLinkRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("topic_links").select("*").eq("topic_id", topicId);
  if (error) throw error;
  return data as TopicLinkRow[];
}

export interface ResolvedTopicLinkItem {
  href: string;
  label: string;
  type: "Entry" | "Source" | "Concept" | "Research project" | "Build project";
}

export async function resolveTopicLinkItems(topicId: string): Promise<ResolvedTopicLinkItem[]> {
  const links = await listTopicLinksForTopic(topicId);
  if (links.length === 0) return [];
  const supabase = await createClient();

  const entryIds = links.map((l) => l.entry_id).filter((v): v is string => !!v);
  const sourceIds = links.map((l) => l.source_id).filter((v): v is string => !!v);
  const conceptIds = links.map((l) => l.concept_id).filter((v): v is string => !!v);
  const projectIds = links.map((l) => l.research_project_id).filter((v): v is string => !!v);
  const buildIds = links.map((l) => l.build_project_id).filter((v): v is string => !!v);

  const [entries, sources, concepts, projects, builds] = await Promise.all([
    entryIds.length
      ? supabase.from("entries").select("id, title, body").in("id", entryIds)
      : Promise.resolve({ data: [] as { id: string; title: string | null; body: string }[] }),
    sourceIds.length
      ? supabase.from("sources").select("id, title").in("id", sourceIds)
      : Promise.resolve({ data: [] as { id: string; title: string }[] }),
    conceptIds.length
      ? supabase.from("concepts").select("id, name").in("id", conceptIds)
      : Promise.resolve({ data: [] as { id: string; name: string }[] }),
    projectIds.length
      ? supabase.from("research_projects").select("id, title").in("id", projectIds)
      : Promise.resolve({ data: [] as { id: string; title: string }[] }),
    buildIds.length
      ? supabase.from("build_projects").select("id, title").in("id", buildIds)
      : Promise.resolve({ data: [] as { id: string; title: string }[] }),
  ]);

  const items: ResolvedTopicLinkItem[] = [];
  (entries.data ?? []).forEach((e) =>
    items.push({ href: `/explore/questions/${e.id}`, label: e.title || e.body.slice(0, 60), type: "Entry" })
  );
  (sources.data ?? []).forEach((s) => items.push({ href: `/library/${s.id}`, label: s.title, type: "Source" }));
  (concepts.data ?? []).forEach((c) => items.push({ href: `/library?q=${encodeURIComponent(c.name)}`, label: c.name, type: "Concept" }));
  (projects.data ?? []).forEach((p) =>
    items.push({ href: `/research/${p.id}/overview`, label: p.title, type: "Research project" })
  );
  (builds.data ?? []).forEach((b) =>
    items.push({ href: `/build/${b.id}/overview`, label: b.title, type: "Build project" })
  );

  return items;
}

export async function listTopicLinksForRecord(
  field: "entry_id" | "source_id" | "concept_id" | "research_project_id" | "build_project_id",
  recordId: string
): Promise<TopicLinkRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("topic_links").select("*").eq(field, recordId);
  if (error) throw error;
  return data as TopicLinkRow[];
}
