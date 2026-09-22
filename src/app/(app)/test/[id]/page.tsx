import Link from "next/link";
import { notFound } from "next/navigation";
import { getTest, listTestResults } from "@/lib/data/test";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { MarkPerformedButton } from "@/components/test/MarkPerformedButton";
import { RecordResultForm } from "@/components/test/RecordResultForm";
import { EmptyState } from "@/components/shared/EmptyState";

export default async function TestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const test = await getTest(id);
  if (!test) notFound();

  const results = await listTestResults(id);
  const canRecordResult = ["performed", "analyzed"].includes(test.status) && !!test.performed_at;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link href="/test" className="text-sm text-accent hover:underline">
          ← Test
        </Link>
        <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
          <h1 className="text-xl font-semibold text-text-primary">{test.title}</h1>
          <StatusBadge status={test.status} />
        </div>
        {test.objective && <p className="mt-1 text-sm text-text-secondary">{test.objective}</p>}
        {test.method && <p className="mt-1 text-sm text-text-secondary">Method: {test.method}</p>}
        {test.success_criteria && <p className="mt-1 text-sm text-text-secondary">Pass criteria: {test.success_criteria}</p>}
      </div>

      {!test.performed_at && (
        <div className="rounded-[var(--radius-card)] border border-dashed border-border bg-panel p-4">
          <p className="text-sm text-text-secondary">
            This test is not marked performed. A planned test never appears as a completed result until it is.
          </p>
          <div className="mt-3">
            <MarkPerformedButton testId={test.id} />
          </div>
        </div>
      )}

      {test.performed_at && (
        <p className="text-sm text-text-secondary">Performed {new Date(test.performed_at).toLocaleString()}</p>
      )}

      <section>
        <h2 className="text-lg font-medium text-text-primary">Results</h2>
        {results.length === 0 ? (
          <div className="mt-3">
            <EmptyState
              title="No result recorded"
              description={canRecordResult ? "Record the result below." : "Mark the test performed first."}
            />
          </div>
        ) : (
          <ul className="mt-3 space-y-3">
            {results.map((r) => (
              <li key={r.id} className="rounded-[var(--radius-card)] border border-border bg-panel p-4 text-sm">
                {r.observations && <p className="text-text-primary">Observations: {r.observations}</p>}
                {r.analysis && <p className="mt-1 text-text-secondary">Analysis: {r.analysis}</p>}
                {r.conclusion && <p className="mt-1 text-text-secondary">Conclusion: {r.conclusion}</p>}
                {r.limitations && <p className="mt-1 text-xs text-text-secondary">Limitations: {r.limitations}</p>}
                <p className="mt-2 text-xs text-text-secondary">{new Date(r.recorded_at).toLocaleString()}</p>
              </li>
            ))}
          </ul>
        )}

        {canRecordResult && (
          <div className="mt-4">
            <RecordResultForm testId={test.id} />
          </div>
        )}
      </section>
    </div>
  );
}
