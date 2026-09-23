// Shared marker format, parsing and prompt boilerplate used by every conversational AI mode
// (Explore with me, Research critic, ...). Keeping this in one place means the marker format can't
// drift between modes and the parser only has to be trusted once.

const SOURCES_MARKER = "SOURCES_JSON:";

export interface SourceRef {
  title: string;
  url: string;
}

// Appended to every mode's system prompt. Keeps replies chat-length and readable.
export function chatFormatInstructions(): string {
  return `This is a chat, not a literature review: reply in at most 3 short paragraphs or a 4-6 item bulleted
list — a couple hundred words, not a thousand. Pick the single most useful angle rather than covering
everything. Write in plain, normal sentences, like you're talking to the person — not a glossary. Use
**bold** only for the rare term that truly needs to stand out, not for every key phrase; most sentences
should have no bold at all.`;
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

export function parseChatResponse(rawText: string): { body: string; sources: SourceRef[] } {
  const sourcesIndex = rawText.indexOf(SOURCES_MARKER);
  if (sourcesIndex === -1) {
    return { body: rawText.trim(), sources: [] };
  }

  const body = rawText.slice(0, sourcesIndex).trim();
  const sourcesJsonPart = rawText.slice(sourcesIndex + SOURCES_MARKER.length).trim();

  return { body, sources: parseSourcesJson(sourcesJsonPart) };
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
