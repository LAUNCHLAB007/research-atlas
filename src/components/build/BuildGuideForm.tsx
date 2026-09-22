"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBuildBrief } from "@/lib/actions/build";

const FIELDS: { key: keyof FormState; label: string; placeholder: string }[] = [
  { key: "title", label: "Working title", placeholder: "What are you calling this idea?" },
  { key: "problem_statement", label: "Problem or research question", placeholder: "What are you trying to solve?" },
  { key: "existing_approaches", label: "Existing approaches (with sources)", placeholder: "What already exists? Where did you find it?" },
  { key: "proposed_contribution", label: "Your modest contribution", placeholder: "What would be new or useful here?" },
  { key: "required_knowledge", label: "Knowledge you still need", placeholder: "Skills, concepts, or techniques to learn first" },
  { key: "available_resources", label: "Available resources", placeholder: "Tools, materials, compute, time" },
  { key: "prototype_scope", label: "Smallest meaningful prototype", placeholder: "The smallest version worth building" },
  { key: "success_criteria", label: "Success criteria", placeholder: "How will you know it worked?" },
  { key: "first_test_plan", label: "First test", placeholder: "What is the first measurable test?" },
];

interface FormState {
  title: string;
  problem_statement: string;
  existing_approaches: string;
  proposed_contribution: string;
  required_knowledge: string;
  available_resources: string;
  prototype_scope: string;
  success_criteria: string;
  first_test_plan: string;
}

const EMPTY: FormState = {
  title: "",
  problem_statement: "",
  existing_approaches: "",
  proposed_contribution: "",
  required_knowledge: "",
  available_resources: "",
  prototype_scope: "",
  success_criteria: "",
  first_test_plan: "",
};

export function BuildGuideForm({ initialProblem }: { initialProblem?: string }) {
  const [form, setForm] = useState<FormState>({ ...EMPTY, problem_statement: initialProblem ?? "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const result = await createBuildBrief(form);
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.push("/build");
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {FIELDS.map((f) => (
        <div key={f.key}>
          <label className="text-sm font-medium text-text-primary">{f.label}</label>
          {f.key === "title" ? (
            <input
              value={form[f.key]}
              onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
              placeholder={f.placeholder}
              className="mt-1 w-full rounded-lg border border-border bg-panel px-3 py-2 text-sm outline-none focus:border-accent"
            />
          ) : (
            <textarea
              value={form[f.key]}
              onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
              placeholder={f.placeholder}
              rows={2}
              className="mt-1 w-full resize-none rounded-lg border border-border bg-panel px-3 py-2 text-sm outline-none focus:border-accent"
            />
          )}
        </div>
      ))}
      {error && <p className="text-sm text-error">{error}</p>}
      <button
        type="submit"
        disabled={saving || !form.title.trim()}
        className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50"
      >
        {saving ? "Saving…" : "Save Build Brief"}
      </button>
    </form>
  );
}
