"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { suggestDomainQuestions, saveAndExploreQuestion } from "@/lib/actions/ai";
import type { LearningDomainId } from "@/lib/types/domain";
import type { ExploreLevel } from "@/lib/ai/suggestQuestions";

const LEVEL_LABEL: Record<ExploreLevel, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

export function SuggestQuestionsButton({ domainId }: { domainId: LearningDomainId }) {
  const [questions, setQuestions] = useState<string[] | null>(null);
  const [level, setLevel] = useState<ExploreLevel | null>(null);
  const [loading, setLoading] = useState(false);
  const [savingIndex, setSavingIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function generate() {
    setLoading(true);
    setError(null);
    const result = await suggestDomainQuestions(domainId);
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setQuestions(result.data.questions);
    setLevel(result.data.level);
  }

  async function explore(question: string, index: number) {
    setSavingIndex(index);
    setError(null);
    const result = await saveAndExploreQuestion(question, domainId);
    setSavingIndex(null);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.push(`/explore/questions/${result.data.id}`);
  }

  if (!questions) {
    return (
      <div>
        <button
          type="button"
          onClick={generate}
          disabled={loading}
          className="rounded-lg border border-dashed border-accent px-3 py-2 text-sm font-medium text-accent hover:bg-accent-selected disabled:opacity-50"
        >
          {loading ? "Thinking of questions…" : "Not sure where to start? Suggest questions"}
        </button>
        {error && <p className="mt-1 text-xs text-error">{error}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs text-text-secondary">
          AI-suggested starting points
          {level && (
            <span className="ml-2 rounded-full bg-inset px-2 py-0.5 font-medium text-text-secondary">
              {LEVEL_LABEL[level]}
            </span>
          )}
        </p>
        <button type="button" onClick={generate} disabled={loading} className="text-xs text-accent hover:underline disabled:opacity-50">
          {loading ? "Regenerating…" : "Regenerate"}
        </button>
      </div>
      {level && (
        <p className="text-xs text-text-secondary">
          Based on how much you&apos;ve explored this domain so far — it gets harder as you go.
        </p>
      )}
      <ul className="space-y-2">
        {questions.map((q, i) => (
          <li key={i} className="flex items-center justify-between gap-3 rounded-[var(--radius-card)] border border-border bg-panel p-3">
            <span className="text-sm text-text-primary">{q}</span>
            <button
              type="button"
              onClick={() => explore(q, i)}
              disabled={savingIndex !== null}
              className="shrink-0 rounded-full border border-accent px-3 py-1 text-xs font-medium text-accent hover:bg-accent-selected disabled:opacity-50"
            >
              {savingIndex === i ? "Opening…" : "Explore this"}
            </button>
          </li>
        ))}
      </ul>
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  );
}
