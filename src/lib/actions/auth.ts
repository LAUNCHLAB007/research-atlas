"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { runAction, ActionError } from "./shared";

export async function signInWithPassword(email: string, password: string) {
  return runAction(async () => {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new ActionError(error.message);
  });
}

export async function signUpWithPassword(email: string, password: string) {
  return runAction(async () => {
    const supabase = await createClient();
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw new ActionError(error.message);
  });
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
