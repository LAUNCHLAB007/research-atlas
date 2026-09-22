"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createTopic } from "@/lib/actions/explore";
import type { LearningDomainId } from "@/lib/types/domain";

export function NewTopicForm({ domainId, parentId }: { domainId: LearningDomainId; parentId?: string }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg border border-dashed border-border px-3 py-2 text-sm text-text-secondary hover:border-accent hover:text-accent"
      >
        + Add subtopic
      </button>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const result = await createTopic({ domain_id: domainId, parent_id: parentId, name });
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setName("");
    setOpen(false);
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="flex flex-wrap items-center gap-2">
      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Subtopic name"
        className="rounded-lg border border-border bg-canvas px-3 py-2 text-sm outline-none focus:border-accent"
      />
      <button
        type="submit"
        disabled={saving || !name.trim()}
        className="rounded-lg bg-accent px-3 py-2 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50"
      >
        Add
      </button>
      <button type="button" onClick={() => setOpen(false)} className="text-sm text-text-secondary hover:text-text-primary">
        Cancel
      </button>
      {error && <p className="w-full text-sm text-error">{error}</p>}
    </form>
  );
}
