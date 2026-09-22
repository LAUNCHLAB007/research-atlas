import { createClient } from "@/lib/supabase/server";
import type { AiSession, AiMessage } from "@/lib/types/domain";

export async function getExploreSessionForEntry(entryId: string): Promise<AiSession | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ai_sessions")
    .select("*")
    .eq("mode", "explore")
    .contains("context", { entry_id: entryId })
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data as AiSession | null;
}

export async function listMessages(sessionId: string): Promise<AiMessage[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ai_messages")
    .select("*")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data as AiMessage[];
}
