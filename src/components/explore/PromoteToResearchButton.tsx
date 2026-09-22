"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { promoteEntryToResearch } from "@/lib/actions/research";

export function PromoteToResearchButton({ entryId }: { entryId: string }) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleClick() {
    setSaving(true);
    setError(null);
    const result = await promoteEntryToResearch(entryId);
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.push(`/research/${result.data.id}/overview`);
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={saving}
        className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-text-primary hover:border-accent hover:text-accent disabled:opacity-50"
      >
        {saving ? "Starting…" : "Start research"}
      </button>
      {error && <p className="mt-1 text-xs text-error">{error}</p>}
    </div>
  );
}
