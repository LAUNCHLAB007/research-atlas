"use server";

import { revalidatePath } from "next/cache";
import { createSourceSchema } from "@/lib/validation/schemas";
import { requireUser, linkTopics, runAction, ActionError } from "./shared";
import type { Source } from "@/lib/types/domain";

export async function createSource(input: unknown, topicIds: string[] = []) {
  return runAction<Source>(async () => {
    const parsed = createSourceSchema.safeParse(input);
    if (!parsed.success) throw new ActionError(parsed.error.issues[0]?.message ?? "Invalid source.");
    const { supabase } = await requireUser();

    const authors = parsed.data.authors
      ? parsed.data.authors.split(",").map((a) => a.trim()).filter(Boolean)
      : null;

    const { data, error } = await supabase
      .from("sources")
      .insert({
        kind: parsed.data.kind,
        title: parsed.data.title,
        url: parsed.data.url || null,
        doi: parsed.data.doi || null,
        authors,
        publication_year: parsed.data.publication_year ?? null,
        provider: parsed.data.provider || null,
        citation: parsed.data.citation || null,
        notes: parsed.data.notes || null,
      })
      .select()
      .single();
    if (error || !data) throw new ActionError(error?.message ?? "Could not save source.");

    await linkTopics(supabase, topicIds, "source_id", data.id);
    revalidatePath("/library");
    return data as Source;
  });
}
