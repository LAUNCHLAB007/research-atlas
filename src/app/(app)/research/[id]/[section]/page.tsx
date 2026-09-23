import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getResearchProject,
  listHypotheses,
  listExperimentPlans,
  listNotebookEntries,
  listEvidenceForProject,
  listResultsForProject,
} from "@/lib/data/research";
import { listSources } from "@/lib/data/sources";
import { ResearchTabs } from "@/components/research/ResearchTabs";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { InlineStatusSelect } from "@/components/shared/InlineStatusSelect";
import { setResearchStatus } from "@/lib/actions/research";
import { BackgroundEditor } from "@/components/research/BackgroundEditor";
import { LinkSourceForm } from "@/components/research/LinkSourceForm";
import { SourceCitation } from "@/components/shared/SourceCitation";
import { NewHypothesisForm } from "@/components/research/NewHypothesisForm";
import { NewExperimentPlanForm } from "@/components/research/NewExperimentPlanForm";
import { NewNotebookEntryForm } from "@/components/research/NewNotebookEntryForm";
import { CritiqueButton } from "@/components/research/CritiqueButton";
import { EmptyState } from "@/components/shared/EmptyState";

const RESEARCH_STATUSES = ["exploring", "literature_review", "planning", "active", "paused", "completed", "archived"];

export default async function ResearchProjectSectionPage({
  params,
}: {
  params: Promise<{ id: string; section: string }>;
}) {
  const { id, section } = await params;
  const project = await getResearchProject(id);
  if (!project) notFound();

  return (
    <div className="space-y-4">
      <div>
        <Link href="/research" className="text-sm text-accent hover:underline">
          ← Research
        </Link>
        <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-text-primary">{project.title}</h1>
            {project.question && <p className="mt-1 text-sm text-text-secondary">{project.question}</p>}
          </div>
          <InlineStatusSelect
            value={project.status}
            options={RESEARCH_STATUSES}
            onChange={(status) => setResearchStatus(project.id, status)}
          />
        </div>
      </div>

      <ResearchTabs projectId={project.id} />

      <div className="pt-2">
        {section === "overview" && (
          <div className="space-y-3 text-sm">
            <p className="text-text-secondary">
              Objective: {project.objective || <span className="italic">Not yet defined — add one in Background.</span>}
            </p>
            <p className="text-text-secondary">
              Current focus: {project.current_focus || <span className="italic">Nothing recorded yet.</span>}
            </p>
            <p className="text-text-secondary">
              Status: <StatusBadge status={project.status} />
            </p>
          </div>
        )}

        {section === "background" && (
          <BackgroundEditor projectId={project.id} objective={project.objective ?? ""} currentFocus={project.current_focus ?? ""} />
        )}

        {section === "evidence" && <EvidenceSection projectId={project.id} />}

        {section === "hypotheses" && <HypothesesSection projectId={project.id} />}

        {section === "experiment-plans" && <ExperimentPlansSection projectId={project.id} />}

        {section === "notebook" && <NotebookSection projectId={project.id} />}

        {section === "results" && <ResultsSection projectId={project.id} />}
      </div>
    </div>
  );
}

async function EvidenceSection({ projectId }: { projectId: string }) {
  const [links, sources] = await Promise.all([listEvidenceForProject(projectId), listSources()]);
  return (
    <div className="space-y-4">
      <LinkSourceForm projectId={projectId} sources={sources} />
      {links.length === 0 ? (
        <EmptyState title="No evidence linked yet" description="Link a source from your Library above." />
      ) : (
        <ul className="space-y-3">
          {links.map((l) => (
            <li key={l.id} className="rounded-[var(--radius-card)] border border-border bg-panel p-3">
              <SourceCitation source={l.source} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

async function HypothesesSection({ projectId }: { projectId: string }) {
  const hypotheses = await listHypotheses(projectId);
  return (
    <div className="space-y-4">
      <NewHypothesisForm projectId={projectId} />
      {hypotheses.length === 0 ? (
        <EmptyState title="No hypotheses yet" description="Add one above." />
      ) : (
        <ul className="space-y-3">
          {hypotheses.map((h) => (
            <li key={h.id} className="rounded-[var(--radius-card)] border border-border bg-panel p-4">
              <div className="flex items-center justify-between">
                <p className="font-medium text-text-primary">{h.statement}</p>
                <StatusBadge status={h.status} />
              </div>
              {h.rationale && <p className="mt-1 text-sm text-text-secondary">{h.rationale}</p>}
              {h.falsification_criteria && (
                <p className="mt-1 text-xs text-text-secondary">Falsified if: {h.falsification_criteria}</p>
              )}
              <div className="mt-2 flex items-center justify-between">
                <p className="text-xs text-text-secondary">Revision {h.revision}</p>
                <CritiqueButton kind="hypothesis" subjectId={h.id} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

async function ExperimentPlansSection({ projectId }: { projectId: string }) {
  const [plans, hypotheses] = await Promise.all([listExperimentPlans(projectId), listHypotheses(projectId)]);
  return (
    <div className="space-y-4">
      <NewExperimentPlanForm projectId={projectId} hypotheses={hypotheses} />
      {plans.length === 0 ? (
        <EmptyState title="No experiment plans yet" description="Add one above." />
      ) : (
        <ul className="space-y-3">
          {plans.map((p) => (
            <li key={p.id} className="rounded-[var(--radius-card)] border border-border bg-panel p-4">
              <div className="flex items-center justify-between">
                <p className="font-medium text-text-primary">{p.title}</p>
                <div className="flex gap-1.5">
                  <StatusBadge status={p.status} />
                  <StatusBadge status={p.approval_status} />
                </div>
              </div>
              {p.method && <p className="mt-1 text-sm text-text-secondary">Method: {p.method}</p>}
              {p.controls && <p className="mt-1 text-xs text-text-secondary">Controls: {p.controls}</p>}
              {p.measurement_plan && <p className="mt-1 text-xs text-text-secondary">Measurement: {p.measurement_plan}</p>}
              <div className="mt-2">
                <CritiqueButton kind="experiment_plan" subjectId={p.id} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

async function NotebookSection({ projectId }: { projectId: string }) {
  const entries = await listNotebookEntries(projectId);
  return (
    <div className="space-y-4">
      <NewNotebookEntryForm projectId={projectId} />
      {entries.length === 0 ? (
        <EmptyState title="Notebook is empty" description="Record literature reviews, decisions and observations here." />
      ) : (
        <ul className="space-y-3">
          {entries.map((e) => (
            <li key={e.id} className="rounded-[var(--radius-card)] border border-border bg-panel p-3 text-sm">
              <div className="flex items-center justify-between text-xs text-text-secondary">
                <span className="capitalize">{e.kind}</span>
                <span>{new Date(e.recorded_at).toLocaleString()}</span>
              </div>
              <p className="mt-1 text-text-primary">{e.body}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

async function ResultsSection({ projectId }: { projectId: string }) {
  const tests = await listResultsForProject(projectId);
  return (
    <div className="space-y-3">
      {tests.length === 0 ? (
        <EmptyState title="No results yet" description="Results appear once a linked test is performed and analyzed." />
      ) : (
        <ul className="space-y-3">
          {tests.map((t) => (
            <li key={t.id} className="rounded-[var(--radius-card)] border border-border bg-panel p-4">
              <div className="flex items-center justify-between">
                <Link href={`/test/${t.id}`} className="font-medium text-text-primary hover:text-accent">
                  {t.title}
                </Link>
                <StatusBadge status={t.status} />
              </div>
              {t.test_results.map((r) => (
                <div key={r.id} className="mt-2 rounded-lg bg-inset p-3 text-sm">
                  {r.conclusion && <p className="text-text-primary">{r.conclusion}</p>}
                  {r.limitations && <p className="mt-1 text-xs text-text-secondary">Limitations: {r.limitations}</p>}
                </div>
              ))}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
