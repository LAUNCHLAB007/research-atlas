"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { markTestPerformed } from "@/lib/actions/test";

export function MarkPerformedButton({ testId }: { testId: string }) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleClick() {
    setSaving(true);
    setError(null);
    const result = await markTestPerformed(testId);
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={saving}
        className="rounded-lg bg-accent px-3 py-1.5 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50"
      >
        {saving ? "Marking…" : "Mark performed now"}
      </button>
      {error && <p className="mt-1 text-xs text-error">{error}</p>}
    </div>
  );
}
