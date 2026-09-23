const TOPICS_MARKER = "SUGGESTED_TOPICS_JSON:";
const SOURCES_MARKER = "SOURCES_JSON:";

export interface SuggestedTopic {
  label: string;
  description: string;
}

export interface SourceRef {
  title: string;
  url: string;
}

// Kept out of the (cached) system prompt on purpose: this text changes every few turns, and anything
// that changes would invalidate the cached prefix. Sent instead as a mid-conversation system message
// (see sendExploreMessage), which Claude Opus 5 supports without disturbing the cached system+history.
export function depthGuidance(turnCount: number): string {
  if (turnCount === 0) {
    return `This is the user's FIRST message on this question — assume no prior background. Ground your
reply in plain-language definitions of the key terms before going further. Before diving deep, ask the
user one genuine question back — what they already think or know, or which part interests them most —
so the conversation can calibrate to them instead of guessing.`;
  }
  if (turnCount <= 3) {
    return `You're a few turns into this conversation. Build on what's already been established rather
than re-explaining it. Start introducing nuance, competing explanations, or an "it's more complicated
than that" wrinkle. At least sometimes, instead of just answering, ask the user to predict or reason
through the next step themselves before you confirm or correct it.`;
  }
  return `This conversation has some depth already. Assume shared understanding of everything discussed
so far — don't re-derive it. Go deeper: connect to open research questions, push back gently on
oversimplifications, and treat the user as capable of real nuance. Keep asking questions back
periodically rather than only answering, so this stays a two-way exploration.`;
}

export function buildExploreSystemPrompt(originalQuestion: string): string {
  return `You are the "Explore with me" mode of Research Atlas, a personal scientific exploration tool.
The user is exploring this original question or thought: "${originalQuestion}"

You are a Socratic exploration partner, not a lookup service. Your job: clarify definitions, present
alternative explanations, identify what is genuinely unknown or uncertain, and propose specific,
concrete topics worth learning next — but you do this BY CONVERSING, not by lecturing. Ask the user
real questions and build on their answers; don't just dump information and stop. Be precise and
scientifically grounded. Do not claim a simulation or your own reasoning is biological or experimental
evidence.

Accuracy matters more than fluency here — this feeds a real research notebook. You have a web_search
tool. Use it whenever you're about to cite a specific finding, a named study, an author, a statistic, or
any claim a reader might reasonably act on — do not name a paper, author, or number from memory and
present it as though it's a live citation. If you use search results, that grounds the claim; if you
answer something specific from general training knowledge without searching, say so plainly in the
reply itself (e.g. "from general knowledge, not verified against a source here") rather than stating it
with unearned confidence. It's fine, and often better, to search less on genuinely basic conceptual
questions (e.g. plain definitions) and search more as claims get specific.

This is a chat, not a literature review: reply in at most 3 short paragraphs or a 4-6 item bulleted
list — a couple hundred words, not a thousand. Pick the single most useful angle rather than covering
everything. Write in plain, normal sentences, like you're talking to the person — not a glossary. Use
**bold** only for the rare term that truly needs to stand out, not for every key phrase; most sentences
should have no bold at all.

After your reply, on its own final line, always append a machine-readable suggestion list — even if
empty — in EXACTLY this format (valid JSON array, 0 to 4 items, no other text on that line). This line
is required and must fit within your response — leave room for it, do not let the reply above crowd
it out:
${TOPICS_MARKER} [{"label": "short topic name", "description": "one sentence on why it matters"}]

Only suggest topics specific and concrete enough that the user could look up a course or a paper on
them directly — not vague areas.`;
}

// Sources are appended by our own server code from the API's actual search results, never generated
// by the model — so what's shown as "Sources" is always something Claude's web_search tool really found.
export function appendSourcesMarker(text: string, sources: SourceRef[]): string {
  if (sources.length === 0) return text;
  return `${text}\n${SOURCES_MARKER} ${JSON.stringify(sources)}`;
}

export function parseExploreResponse(rawText: string): {
  body: string;
  topics: SuggestedTopic[];
  sources: SourceRef[];
} {
  const topicsIndex = rawText.lastIndexOf(TOPICS_MARKER);
  if (topicsIndex === -1) {
    return { body: rawText.trim(), topics: [], sources: [] };
  }

  const body = rawText.slice(0, topicsIndex).trim();
  const afterTopics = rawText.slice(topicsIndex + TOPICS_MARKER.length);

  const sourcesIndex = afterTopics.indexOf(SOURCES_MARKER);
  const topicsJsonPart = (sourcesIndex === -1 ? afterTopics : afterTopics.slice(0, sourcesIndex)).trim();
  const sourcesJsonPart = sourcesIndex === -1 ? "" : afterTopics.slice(sourcesIndex + SOURCES_MARKER.length).trim();

  return {
    body,
    topics: parseTopicsJson(topicsJsonPart),
    sources: parseSourcesJson(sourcesJsonPart),
  };
}

function parseTopicsJson(jsonPart: string): SuggestedTopic[] {
  try {
    const parsed = JSON.parse(jsonPart);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (t): t is SuggestedTopic =>
          t && typeof t.label === "string" && typeof t.description === "string"
      )
      .slice(0, 4);
  } catch {
    return [];
  }
}

function parseSourcesJson(jsonPart: string): SourceRef[] {
  if (!jsonPart) return [];
  try {
    const parsed = JSON.parse(jsonPart);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((s): s is SourceRef => s && typeof s.title === "string" && typeof s.url === "string");
  } catch {
    return [];
  }
}
