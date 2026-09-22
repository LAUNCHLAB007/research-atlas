import Link from "next/link";
import { listSources, searchSources } from "@/lib/data/sources";
import { listTopics } from "@/lib/data/topics";
import { NewSourceForm } from "@/components/library/NewSourceForm";
import { EmptyState } from "@/components/shared/EmptyState";

export default async function LibraryPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const [sources, topics] = await Promise.all([q ? searchSources(q) : listSources(), listTopics()]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">Library</h1>
          <p className="mt-1 text-sm text-text-secondary">
            One searchable catalog of papers, lectures, datasets, books, websites and files.
          </p>
        </div>
        <NewSourceForm topics={topics} />
      </div>

      <form className="max-w-md">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Search title or notes…"
          className="w-full rounded-lg border border-border bg-panel px-3 py-2 text-sm outline-none focus:border-accent"
        />
      </form>

      {sources.length === 0 ? (
        <EmptyState title={q ? "No matches" : "Nothing in your Library yet"} description={q ? "Try a different search." : "Add a source above."} />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {sources.map((s) => (
            <li key={s.id}>
              <Link
                href={`/library/${s.id}`}
                className="block rounded-[var(--radius-card)] border border-border bg-panel p-4 hover:border-accent hover:shadow-sm"
              >
                <span className="mb-1 inline-block rounded-full bg-inset px-2 py-0.5 text-xs font-medium capitalize text-text-secondary">
                  {s.kind}
                </span>
                <p className="font-medium text-text-primary">{s.title}</p>
                <p className="mt-0.5 text-sm text-text-secondary">
                  {[s.authors?.join(", "), s.publication_year].filter(Boolean).join(" · ")}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
