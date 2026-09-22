import { createClient } from "@/lib/supabase/server";
import type { Source } from "@/lib/types/domain";

export async function listSources(limit = 100): Promise<Source[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sources")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data as Source[];
}

export async function getSource(id: string): Promise<Source | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("sources").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data as Source | null;
}

export async function searchSources(query: string): Promise<Source[]> {
  const supabase = await createClient();
  // Strip characters that have special meaning in PostgREST filter syntax before interpolating.
  const safe = query.replace(/[,()%*]/g, " ").trim();
  if (!safe) return [];
  const { data, error } = await supabase
    .from("sources")
    .select("*")
    .or(`title.ilike.%${safe}%,notes.ilike.%${safe}%`)
    .limit(50);
  if (error) throw error;
  return data as Source[];
}
