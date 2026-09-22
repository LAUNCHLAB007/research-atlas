import { listResearchProjects } from "@/lib/data/research";
import { listTopics } from "@/lib/data/topics";
import { RecordCard } from "@/components/shared/RecordCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { NewResearchProjectForm } from "@/components/research/NewResearchProjectForm";

export default async function ResearchHomePage() {
  const [projects, topics] = await Promise.all([listResearchProjects(), listTopics()]);
  const active = projects.filter((p) => !["completed", "archived"].includes(p.status));
  const closed = projects.filter((p) => ["completed", "archived"].includes(p.status));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">Research</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Turn a question into a traceable investigation.
          </p>
        </div>
        <NewResearchProjectForm topics={topics} />
      </div>

      {projects.length === 0 ? (
        <EmptyState title="No research projects yet" description="Start one above, or promote a question from Explore." />
      ) : (
        <>
          <section>
            <h2 className="text-lg font-medium text-text-primary">Active &amp; paused</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {active.map((p) => (
                <RecordCard
                  key={p.id}
                  href={`/research/${p.id}/overview`}
                  title={p.title}
                  subtitle={p.question}
                  status={p.status}
                  updatedAt={p.updated_at}
                />
              ))}
            </div>
          </section>
          {closed.length > 0 && (
            <section>
              <h2 className="text-lg font-medium text-text-primary">Completed &amp; archived</h2>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {closed.map((p) => (
                  <RecordCard
                    key={p.id}
                    href={`/research/${p.id}/overview`}
                    title={p.title}
                    subtitle={p.question}
                    status={p.status}
                    updatedAt={p.updated_at}
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
