import { listTests } from "@/lib/data/test";
import { listResearchProjects, listAllExperimentPlans } from "@/lib/data/research";
import { listAllPrototypeVersions } from "@/lib/data/build";
import { RecordCard } from "@/components/shared/RecordCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { NewTestForm } from "@/components/test/NewTestForm";

const STATUS_ORDER = ["planned", "ready", "in_progress", "performed", "analyzed", "cancelled"];

export default async function TestHomePage({
  searchParams,
}: {
  searchParams: Promise<{ buildProject?: string }>;
}) {
  const { buildProject } = await searchParams;
  const [tests, projects, plans, versions] = await Promise.all([
    listTests(),
    listResearchProjects(),
    listAllExperimentPlans(),
    listAllPrototypeVersions(),
  ]);

  const grouped = STATUS_ORDER.map((status) => ({
    status,
    items: tests.filter((t) => t.status === status),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-text-primary">Test</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Record whether a hypothesis, method or prototype version meets predefined criteria.
        </p>
      </div>

      <NewTestForm
        projects={projects}
        plans={plans}
        versions={versions}
        initialVersionId={buildProject ? versions.find((v) => v.build_project_id === buildProject)?.id : undefined}
      />

      {tests.length === 0 ? (
        <EmptyState title="No tests yet" description="Create one above, linked to a project, plan, or prototype version." />
      ) : (
        grouped.map((g) => (
          <section key={g.status}>
            <h2 className="text-lg font-medium capitalize text-text-primary">{g.status.replace(/_/g, " ")}</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {g.items.map((t) => (
                <RecordCard
                  key={t.id}
                  href={`/test/${t.id}`}
                  title={t.title}
                  subtitle={t.objective}
                  status={t.status}
                  updatedAt={t.updated_at}
                />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
