"use server";

import { revalidatePath } from "next/cache";
import { createEntrySchema, createTopicSchema } from "@/lib/validation/schemas";
import { requireUser, linkTopics, runAction, ActionError } from "./shared";
import type { Entry } from "@/lib/types/domain";

export async function createEntry(input: unknown) {
  return runAction<Entry>(async () => {
    const parsed = createEntrySchema.safeParse(input);
    if (!parsed.success) throw new ActionError(parsed.error.issues[0]?.message ?? "Invalid entry.");
    const { supabase } = await requireUser();

    const { data, error } = await supabase
      .from("entries")
      .insert({
        kind: parsed.data.kind,
        title: parsed.data.title || null,
        body: parsed.data.body,
        original_body: parsed.data.body,
      })
      .select()
      .single();
    if (error || !data) throw new ActionError(error?.message ?? "Could not save entry.");

    await linkTopics(supabase, parsed.data.topicIds, "entry_id", data.id);
    revalidatePath("/explore");
    return data as Entry;
  });
}

export async function saveQuestionFromLecture(lectureId: string, body: string) {
  return runAction<Entry>(async () => {
    if (!body.trim()) throw new ActionError("Write a question before saving.");
    const { supabase } = await requireUser();
    const { data: entry, error } = await supabase
      .from("entries")
      .insert({ kind: "question", body, original_body: body })
      .select()
      .single();
    if (error || !entry) throw new ActionError(error?.message ?? "Could not save question.");

    await supabase.from("record_links").insert({
      relationship: "derived_from",
      entry_id: entry.id,
      lecture_id: lectureId,
    });

    revalidatePath(`/classroom/lectures/${lectureId}`);
    revalidatePath("/explore");
    return entry as Entry;
  });
}

export async function updateEntryBody(entryId: string, body: string) {
  return runAction(async () => {
    if (!body.trim()) throw new ActionError("Write something before saving.");
    const { supabase } = await requireUser();
    const { error } = await supabase.from("entries").update({ body }).eq("id", entryId);
    if (error) throw new ActionError(error.message);
    revalidatePath(`/explore/questions/${entryId}`);
  });
}

export async function createTopic(input: unknown) {
  return runAction(async () => {
    const parsed = createTopicSchema.safeParse(input);
    if (!parsed.success) throw new ActionError(parsed.error.issues[0]?.message ?? "Invalid topic.");
    const { supabase } = await requireUser();
    const { data, error } = await supabase
      .from("topics")
      .insert({
        domain_id: parsed.data.domain_id,
        parent_id: parsed.data.parent_id || null,
        name: parsed.data.name,
        description: parsed.data.description || null,
      })
      .select()
      .single();
    if (error || !data) throw new ActionError(error?.message ?? "Could not create topic.");
    revalidatePath("/explore");
    return data;
  });
}

export async function ensureRootTopic(domainId: number, domainName: string) {
  const { supabase, user } = await requireUser();
  const { data: existing } = await supabase
    .from("topics")
    .select("*")
    .eq("domain_id", domainId)
    .is("parent_id", null)
    .eq("name", domainName)
    .maybeSingle();
  if (existing) return existing;

  const { data, error } = await supabase
    .from("topics")
    .insert({ domain_id: domainId, name: domainName, user_id: user.id })
    .select()
    .single();
  if (error || !data) throw new ActionError(error?.message ?? "Could not create root topic.");
  return data;
}
