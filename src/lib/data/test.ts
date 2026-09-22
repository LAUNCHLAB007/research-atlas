import { createClient } from "@/lib/supabase/server";
import type { Test, TestResult } from "@/lib/types/domain";

export async function listTests(): Promise<Test[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tests")
    .select("*")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return data as Test[];
}

export async function getTest(id: string): Promise<Test | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("tests").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data as Test | null;
}

export async function listTestResults(testId: string): Promise<TestResult[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("test_results")
    .select("*")
    .eq("test_id", testId)
    .order("recorded_at", { ascending: false });
  if (error) throw error;
  return data as TestResult[];
}
