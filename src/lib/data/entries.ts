import { createClient } from "@/lib/supabase/server";
import type { Entry, EntryRevision } from "@/lib/types/domain";

export async function listEntries(limit = 50): Promise<Entry[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("entries")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data as Entry[];
}

export async function getEntry(id: string): Promise<Entry | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("entries").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data as Entry | null;
}

export async function listEntryRevisions(entryId: string): Promise<EntryRevision[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("entry_revisions")
    .select("*")
    .eq("entry_id", entryId)
    .order("changed_at", { ascending: false });
  if (error) throw error;
  return data as EntryRevision[];
}
