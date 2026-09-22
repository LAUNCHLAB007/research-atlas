import Link from "next/link";
import { listEntries } from "@/lib/data/entries";
import { LEARNING_DOMAINS } from "@/lib/constants/domains";
import { RecordCard } from "@/components/shared/RecordCard";
import { EmptyState } from "@/components/shared/EmptyState";

export default async function ExplorePage() {
  const entries = await listEntries(12);
  const questions = entries.filter((e) => e.kind === "question").slice(0, 6);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-text-primary">Explore</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Begin with a question, browse the five domains, and follow cross-topic connections.
        </p>
      </div>

      <section>
        <h2 className="text-lg font-medium text-text-primary">Domains</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {LEARNING_DOMAINS.map((domain) => (
            <Link
              key={domain.id}
              href={`/explore/topics/${domain.id}`}
              className="rounded-[var(--radius-card)] border border-border bg-panel p-4 transition hover:border-accent hover:shadow-sm"
            >
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: domain.colorVar }} aria-hidden />
                <h3 className="font-medium text-text-primary">{domain.name}</h3>
              </div>
              <p className="mt-1.5 text-sm text-text-secondary">{domain.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-medium text-text-primary">Curiosity Notebook</h2>
        <p className="text-sm text-text-secondary">Recent captures, chronological.</p>
        {entries.length === 0 ? (
          <div className="mt-3">
            <EmptyState title="Nothing captured yet" description="Use + Capture to save your first question or thought." />
          </div>
        ) : (
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {entries.map((e) => (
              <RecordCard
                key={e.id}
                href={`/explore/questions/${e.id}`}
                title={e.title || e.body.slice(0, 80)}
                subtitle={e.body}
                provenance={e.provenance}
                meta={e.kind}
                updatedAt={e.updated_at}
              />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-lg font-medium text-text-primary">Saved questions</h2>
        {questions.length === 0 ? (
          <p className="mt-2 text-sm text-text-secondary">No saved questions yet.</p>
        ) : (
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {questions.map((q) => (
              <RecordCard
                key={q.id}
                href={`/explore/questions/${q.id}`}
                title={q.title || q.body.slice(0, 80)}
                provenance={q.provenance}
                updatedAt={q.updated_at}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
