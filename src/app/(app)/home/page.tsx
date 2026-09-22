import Link from "next/link";
import { listEntries } from "@/lib/data/entries";
import { listResearchProjects } from "@/lib/data/research";
import { listBuildProjects } from "@/lib/data/build";
import { listTests } from "@/lib/data/test";
import { listRecentLectures } from "@/lib/data/classroom";
import { WORKSPACE_NAV } from "@/lib/constants/nav";
import { RecordCard } from "@/components/shared/RecordCard";
import { EmptyState } from "@/components/shared/EmptyState";

export default async function HomePage() {
  const [entries, projects, builds, tests, lectures] = await Promise.all([
    listEntries(6),
    listResearchProjects(),
    listBuildProjects(),
    listTests(),
    listRecentLectures(3),
  ]);

  const questions = entries.filter((e) => e.kind === "question").slice(0, 5);

  type ContinueItem = { href: string; title: string; subtitle: string; updatedAt: string };
  const continueItems: ContinueItem[] = [
    ...lectures.map((l) => ({
      href: `/classroom/lectures/${l.id}`,
      title: l.source.title,
      subtitle: "Classroom lecture",
      updatedAt: l.updated_at,
    })),
    ...projects.slice(0, 3).map((p) => ({
      href: `/research/${p.id}/overview`,
      title: p.title,
      subtitle: "Research project",
      updatedAt: p.updated_at,
    })),
    ...builds.slice(0, 3).map((b) => ({
      href: `/build/${b.id}/overview`,
      title: b.title,
      subtitle: "Build project",
      updatedAt: b.updated_at,
    })),
    ...tests.slice(0, 3).map((t) => ({
      href: `/test/${t.id}`,
      title: t.title,
      subtitle: "Test",
      updatedAt: t.updated_at,
    })),
  ]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 4);

  return (
    <div className="space-y-8">
      <section className="rounded-[var(--radius-dialog)] border border-border bg-panel p-6">
        <h1 className="text-2xl font-semibold text-text-primary md:text-3xl">What are you curious about?</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Use + Capture in the top bar to save a question, thought, observation, idea or link — no research plan required.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-medium text-text-primary">Continue where you left off</h2>
        {continueItems.length === 0 ? (
          <div className="mt-3">
            <EmptyState
              title="Nothing in progress yet"
              description="Capture a question or start in any workspace below to see it here."
            />
          </div>
        ) : (
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {continueItems.map((item) => (
              <RecordCard key={item.href} href={item.href} title={item.title} meta={item.subtitle} updatedAt={item.updatedAt} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-lg font-medium text-text-primary">Workspaces</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {WORKSPACE_NAV.map((w) => (
            <Link
              key={w.href}
              href={w.href}
              className="rounded-[var(--radius-card)] border border-border bg-panel p-4 font-medium text-text-primary transition hover:border-accent hover:shadow-sm"
            >
              {w.label}
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-medium text-text-primary">Recent questions</h2>
        {questions.length === 0 ? (
          <div className="mt-3">
            <EmptyState title="No questions yet" description="Capture your first question to start exploring." />
          </div>
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
