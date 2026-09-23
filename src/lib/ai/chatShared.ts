// Shared marker format, parsing and prompt boilerplate used by every conversational AI mode
// (Explore with me, Research critic, ...). Keeping this in one place means the marker format can't
// drift between modes and the parser only has to be trusted once.

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

// Appended to every mode's system prompt. Keeps replies chat-length and readable, and defines the
// machine-readable suggestion line every mode's parser expects to find.
export function chatFormatInstructions(): string {
  return `This is a chat, not a literature review: reply in at most 3 short paragraphs or a 4-6 item bulleted
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

// Same accuracy/grounding rule for every mode that has web_search available.
export function webSearchInstructions(): string {
  return `Accuracy matters more than fluency here — this feeds a real research notebook. You have a web_search
tool. Use it whenever you're about to cite a specific finding, a named study, an author, a statistic, or
any claim a reader might reasonably act on — do not name a paper, author, or number from memory and
present it as though it's a live citation. If you use search results, that grounds the claim; if you
answer something specific from general training knowledge without searching, say so plainly in the
reply itself (e.g. "from general knowledge, not verified against a source here") rather than stating it
with unearned confidence. It's fine, and often better, to search less on genuinely basic conceptual
questions and search more as claims get specific.`;
}

// Sources are appended by our own server code from the API's actual search results, never generated
// by the model — so what's shown as "Sources" is always something Claude's web_search tool really found.
export function appendSourcesMarker(text: string, sources: SourceRef[]): string {
  if (sources.length === 0) return text;
  return `${text}\n${SOURCES_MARKER} ${JSON.stringify(sources)}`;
}

export function parseChatResponse(rawText: string): {
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
      .filter((t): t is SuggestedTopic => t && typeof t.label === "string" && typeof t.description === "string")
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
