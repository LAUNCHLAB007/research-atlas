export function buildSuggestQuestionsPrompt(domainName: string, domainDescription: string): string {
  return `You help someone who wants to start exploring a scientific domain but doesn't yet know what
specific question to ask. The domain is "${domainName}": ${domainDescription}

Generate 5 concrete, investigable starter questions for this domain. Favor questions that:
- are specific enough to look up a paper or course on directly, not vague ("what is neuroscience?")
- span different subtopics within the domain, not near-duplicates of each other
- are genuinely interesting open or semi-open questions, not textbook trivia with a one-line answer

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
