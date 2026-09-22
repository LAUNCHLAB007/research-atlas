import Link from "next/link";
import { notFound } from "next/navigation";
import { getEntry, listEntryRevisions } from "@/lib/data/entries";
import { listTopicLinksForRecord, getTopic } from "@/lib/data/topics";
import { ProvenanceBadge } from "@/components/shared/ProvenanceBadge";
import { EntryEditor } from "@/components/explore/EntryEditor";
import { PromoteToResearchButton } from "@/components/explore/PromoteToResearchButton";

export default async function QuestionExplorerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const entry = await getEntry(id);
  if (!entry) notFound();

  const [revisions, topicLinks] = await Promise.all([
    listEntryRevisions(entry.id),
    listTopicLinksForRecord("entry_id", entry.id),
  ]);
  const topics = await Promise.all(topicLinks.map((l) => getTopic(l.topic_id)));

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-4">
        <div>
          <Link href="/explore" className="text-sm text-accent hover:underline">
            ← Explore
          </Link>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <ProvenanceBadge provenance={entry.provenance} />
            <span className="rounded-full bg-inset px-2.5 py-1 text-xs font-medium capitalize text-text-secondary">
              {entry.kind}
            </span>
          </div>
          <h1 className="mt-2 text-xl font-semibold text-text-primary">{entry.title || "Untitled"}</h1>
          <p className="mt-1 text-xs text-text-secondary">
            Original: <span className="italic">&ldquo;{entry.original_body}&rdquo;</span> ·{" "}
            {new Date(entry.created_at).toLocaleDateString()}
          </p>
        </div>

        <EntryEditor entryId={entry.id} initialBody={entry.body} />

        {topics.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {topics.filter(Boolean).map((t) => (
              <Link
                key={t!.id}
                href={`/explore/topics/${t!.id}`}
                className="rounded-full border border-border px-2.5 py-1 text-xs text-text-secondary hover:border-accent hover:text-accent"
              >
                {t!.name}
              </Link>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <PromoteToResearchButton entryId={entry.id} />
          <Link
            href={`/library?q=${encodeURIComponent(entry.body.slice(0, 60))}`}
            className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-text-primary hover:border-accent hover:text-accent"
          >
            Find paper
          </Link>
          <Link
            href="/classroom"
            className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-text-primary hover:border-accent hover:text-accent"
          >
            Find lecture
          </Link>
          <Link
            href={`/build/guide?fromEntry=${entry.id}`}
            className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-text-primary hover:border-accent hover:text-accent"
          >
            Open Build Guide
          </Link>
        </div>

        {revisions.length > 0 && (
          <div>
            <h2 className="text-sm font-medium text-text-primary">Edit history</h2>
            <ul className="mt-2 space-y-2">
              {revisions.map((r) => (
                <li key={r.id} className="rounded-[var(--radius-card)] border border-border bg-panel p-3 text-sm">
                  <p className="text-xs text-text-secondary">{new Date(r.changed_at).toLocaleString()}</p>
                  <p className="mt-1 text-text-secondary">{r.previous_body}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <aside className="rounded-[var(--radius-card)] border border-dashed border-border bg-panel p-4">
        <h2 className="text-sm font-medium text-text-primary">AI-guided exploration</h2>
        <p className="mt-2 text-sm text-text-secondary">
          Selectable AI modes (definitions, alternative explanations, follow-up questions) ship in a later phase.
          Everything you save here stays a plain, source-attributed record until then.
        </p>
      </aside>
    </div>
  );
}
