export type ExploreLevel = "beginner" | "intermediate" | "advanced";

// Simple activity-based ramp: more entries already captured in a domain → harder suggestions.
export function levelFromEntryCount(count: number): ExploreLevel {
  if (count < 3) return "beginner";
  if (count < 10) return "intermediate";
  return "advanced";
}

const LEVEL_INSTRUCTIONS: Record<ExploreLevel, string> = {
  beginner: `Write BEGINNER questions for someone with no background in this domain at all. Favor
plain "What is X?" / "Why does Y happen?" / "How does Z work?" phrasing about foundational concepts —
the kind of question a first course in this field would open with. Avoid jargon in the question itself,
avoid citing specific papers, models or methods, and avoid anything that assumes prior coursework.`,
  intermediate: `Write INTERMEDIATE questions for someone who already knows the basic vocabulary and
mechanisms of this domain and is ready to connect ideas, compare competing explanations, or ask "why"
and "how do we know" questions — more than a textbook definition, less than open research.`,
  advanced: `Write ADVANCED questions at the edge of current understanding in this domain — genuinely
open or contested questions, naming specific methods, models, or findings where relevant, the kind a
working researcher would find non-trivial.`,
};

export function buildSuggestQuestionsPrompt(
  domainName: string,
  domainDescription: string,
  level: ExploreLevel
): string {
  return `You help someone who wants to start exploring a scientific domain but doesn't yet know what
specific question to ask. The domain is "${domainName}": ${domainDescription}

${LEVEL_INSTRUCTIONS[level]}

Generate 5 concrete, investigable questions for this domain at that level. Favor questions that:
- are specific enough to look up a paper, course, or textbook chapter on directly, not vague ("what is neuroscience?")
- span different subtopics within the domain, not near-duplicates of each other
- are genuinely interesting, not rote trivia with a one-line answer

Respond with ONLY a JSON array of 5 strings (the questions), no other text, no markdown code fence.`;
}

export function parseQuestionsResponse(rawText: string): string[] {
  const cleaned = rawText.trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "");
  try {
    const parsed = JSON.parse(cleaned);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((q): q is string => typeof q === "string" && q.trim().length > 0).slice(0, 6);
  } catch {
    return [];
  }
}
