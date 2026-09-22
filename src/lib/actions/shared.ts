import { createClient } from "@/lib/supabase/server";

export class ActionError extends Error {}

export async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new ActionError("You must be signed in.");
  return { supabase, user };
}

export async function linkTopics(
  supabase: Awaited<ReturnType<typeof createClient>>,
  topicIds: string[],
  field:
    | "entry_id"
    | "source_id"
    | "concept_id"
    | "research_project_id"
    | "build_project_id",
  recordId: string
) {
  if (topicIds.length === 0) return;
  const rows = topicIds.map((topic_id) => {
    const row: {
      topic_id: string;
      entry_id?: string;
      source_id?: string;
      concept_id?: string;
      research_project_id?: string;
      build_project_id?: string;
    } = { topic_id };
    row[field] = recordId;
    return row;
  });
  const { error } = await supabase.from("topic_links").insert(rows);
  if (error) throw new ActionError(error.message);
}

export type ActionResult<T = undefined> = { ok: true; data: T } | { ok: false; error: string };

export async function runAction<T>(fn: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    const data = await fn();
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Something went wrong." };
  }
}
