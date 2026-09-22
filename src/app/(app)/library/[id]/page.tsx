import Link from "next/link";
import { notFound } from "next/navigation";
import { getSource } from "@/lib/data/sources";
import { listTopicLinksForRecord, getTopic } from "@/lib/data/topics";
import { SourceCitation } from "@/components/shared/SourceCitation";

export default async function SourceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const source = await getSource(id);
  if (!source) notFound();

  const topicLinks = await listTopicLinksForRecord("source_id", source.id);
  const topics = await Promise.all(topicLinks.map((l) => getTopic(l.topic_id)));

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Link href="/library" className="text-sm text-accent hover:underline">
        ← Library
      </Link>

      <div>
        <span className="mb-2 inline-block rounded-full bg-inset px-2.5 py-1 text-xs font-medium capitalize text-text-secondary">
          {source.kind}
        </span>
        <SourceCitation source={source} />
      </div>

      {source.citation && (
        <div>
          <h2 className="text-sm font-medium text-text-primary">Citation</h2>
          <p className="mt-1 text-sm text-text-secondary">{source.citation}</p>
        </div>
      )}

      {source.notes && (
        <div>
          <h2 className="text-sm font-medium text-text-primary">Notes</h2>
          <p className="mt-1 whitespace-pre-wrap text-sm text-text-secondary">{source.notes}</p>
        </div>
      )}

      {source.provider && <p className="text-sm text-text-secondary">Provider: {source.provider}</p>}
      {source.doi && <p className="text-sm text-text-secondary">DOI: {source.doi}</p>}

      {topics.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-text-primary">Topics</h2>
          <div className="mt-1 flex flex-wrap gap-2">
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
        </div>
      )}
    </div>
  );
}
