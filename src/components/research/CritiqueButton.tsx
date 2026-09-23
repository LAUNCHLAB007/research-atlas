"use client";

import { useState } from "react";
import { sendCritiqueMessage, getCritiqueMessages, type CritiqueSubjectKind } from "@/lib/actions/researchCritic";
import { AiChatPanel } from "@/components/shared/ai/AiChatPanel";
import type { AiMessage } from "@/lib/types/domain";

export function CritiqueButton({ kind, subjectId }: { kind: CritiqueSubjectKind; subjectId: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialMessages, setInitialMessages] = useState<AiMessage[] | null>(null);

  async function handleOpen() {
    setOpen(true);
    if (initialMessages !== null) return;
    setLoading(true);
    const messages = await getCritiqueMessages(kind, subjectId);
    setInitialMessages(messages);
    setLoading(false);
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={handleOpen}
        className="rounded-full border border-dashed border-accent px-2.5 py-1 text-xs font-medium text-accent hover:bg-accent-selected"
      >
        Critique with AI
      </button>
    );
  }

  return (
    <div className="mt-3 h-[420px]">
      <div className="mb-2 flex justify-end">
        <button type="button" onClick={() => setOpen(false)} className="text-xs text-text-secondary hover:text-text-primary">
          Collapse
        </button>
      </div>
      {loading || initialMessages === null ? (
        <p className="text-xs text-text-secondary">Loading…</p>
      ) : (
        <AiChatPanel
          title="Research critic"
          subtitle="AI-generated. A critique to work from, not a verdict."
          placeholder="Push back, or ask what would fix this…"
          emptyStateText="Starting a critique — this may take a moment while it checks for existing work on this."
          suggestionsLabel="Worth reading, from this critique"
          initialMessages={initialMessages}
          onSend={(text) => sendCritiqueMessage(kind, subjectId, text)}
          autoStartMessage={`Please critique this ${kind === "hypothesis" ? "hypothesis" : "experiment plan"}.`}
        />
      )}
    </div>
  );
}
