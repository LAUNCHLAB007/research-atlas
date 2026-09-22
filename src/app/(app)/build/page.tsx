import Link from "next/link";
import { listBuildBriefs, listBuildProjects } from "@/lib/data/build";
import { RecordCard } from "@/components/shared/RecordCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { NewBuildProjectForm } from "@/components/build/NewBuildProjectForm";

export default async function BuildHomePage() {
  const [briefs, projects] = await Promise.all([listBuildBriefs(), listBuildProjects()]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-text-primary">Build</h1>
        <p className="mt-1 text-sm text-text-secondary">From uncertainty to prototype. Not limited to code.</p>
      </div>

      <section className="grid gap-3 sm:grid-cols-3">
        <Link
          href="/build/guide"
          className="rounded-[var(--radius-card)] border border-border bg-panel p-4 hover:border-accent hover:shadow-sm"
        >
          <p className="font-medium text-text-primary">I have an idea</p>
          <p className="mt-1 text-sm text-text-secondary">Walk through the Build Guide to shape it into a brief.</p>
        </Link>
        <Link
          href="/build/guide"
          className="rounded-[var(--radius-card)] border border-border bg-panel p-4 hover:border-accent hover:shadow-sm"
        >
          <p className="font-medium text-text-primary">I have a problem/question</p>
          <p className="mt-1 text-sm text-text-secondary">Start from what&apos;s unsolved and find a contribution.</p>
        </Link>
        <Link
          href="/build/guide"
          className="rounded-[var(--radius-card)] border border-border bg-panel p-4 hover:border-accent hover:shadow-sm"
        >
          <p className="font-medium text-text-primary">Help me discover what to build</p>
          <p className="mt-1 text-sm text-text-secondary">The guide can point back to Classroom or Research first.</p>
        </Link>
      </section>

      <NewBuildProjectForm briefs={briefs} />

      <section>
        <h2 className="text-lg font-medium text-text-primary">Build Briefs</h2>
        {briefs.length === 0 ? (
          <p className="mt-2 text-sm text-text-secondary">No briefs yet.</p>
        ) : (
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {briefs.map((b) => (
              <div key={b.id} className="rounded-[var(--radius-card)] border border-border bg-panel p-4">
                <p className="font-medium text-text-primary">{b.title}</p>
                {b.problem_statement && <p className="mt-1 line-clamp-2 text-sm text-text-secondary">{b.problem_statement}</p>}
                <p className="mt-2 text-xs capitalize text-text-secondary">{b.readiness_status.replace(/_/g, " ")}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-lg font-medium text-text-primary">Build Projects</h2>
        {projects.length === 0 ? (
          <EmptyState title="No build projects yet" description="Create one from a brief, or skip the guide above." />
        ) : (
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => (
              <RecordCard
                key={p.id}
                href={`/build/${p.id}/overview`}
                title={p.title}
                subtitle={p.purpose}
                status={p.status}
                meta={p.kind.replace(/_/g, " ")}
                updatedAt={p.updated_at}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
