const TOPICS_MARKER = "SUGGESTED_TOPICS_JSON:";

export interface SuggestedTopic {
  label: string;
  description: string;
}

export function buildExploreSystemPrompt(originalQuestion: string): string {
  return `You are the "Explore with me" mode of Research Atlas, a personal scientific exploration tool.
The user is exploring this original question or thought: "${originalQuestion}"

Your job in this mode: clarify definitions, present alternative explanations, suggest follow-up
questions, identify what is genuinely unknown or uncertain, and propose specific, concrete topics
worth learning next. Be precise and scientifically grounded. Clearly flag speculation as speculation.
Do not claim a simulation or your own reasoning is biological or experimental evidence. Keep replies
focused and skimmable — a few short paragraphs or a short list, not an essay.

After your reply, on its own final line, always append a machine-readable suggestion list — even if
empty — in EXACTLY this format (valid JSON array, 0 to 4 items, no other text on that line):
${TOPICS_MARKER} [{"label": "short topic name", "description": "one sentence on why it matters"}]

Only suggest topics specific and concrete enough that the user could look up a course or a paper on
them directly — not vague areas.`;
}

export function parseExploreResponse(rawText: string): { body: string; topics: SuggestedTopic[] } {
  const markerIndex = rawText.lastIndexOf(TOPICS_MARKER);
  if (markerIndex === -1) {
    return { body: rawText.trim(), topics: [] };
  }

  const body = rawText.slice(0, markerIndex).trim();
  const jsonPart = rawText.slice(markerIndex + TOPICS_MARKER.length).trim();

  try {
    const parsed = JSON.parse(jsonPart);
    if (!Array.isArray(parsed)) return { body, topics: [] };
    const topics = parsed
      .filter(
        (t): t is SuggestedTopic =>
          t && typeof t.label === "string" && typeof t.description === "string"
      )
      .slice(0, 4);
    return { body, topics };
  } catch {
    return { body, topics: [] };
  }
}
