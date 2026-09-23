import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getBuildProject,
  listPrototypeVersions,
  listBuildIssues,
  listFilesForBuildProject,
  listTestsForBuildProject,
} from "@/lib/data/build";
import { BuildTabs } from "@/components/build/BuildTabs";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { InlineStatusSelect } from "@/components/shared/InlineStatusSelect";
import { setBuildProjectStatus } from "@/lib/actions/build";
import { NewPrototypeVersionForm } from "@/components/build/NewPrototypeVersionForm";
import { NewBuildIssueForm } from "@/components/build/NewBuildIssueForm";
import { BuildWorkspaceUploader } from "@/components/build/BuildWorkspaceUploader";
import { EmptyState } from "@/components/shared/EmptyState";

const BUILD_STATUSES = ["concept", "designing", "building", "testing", "paused", "completed", "archived"];

export default async function BuildProjectSectionPage({
  params,
}: {
  params: Promise<{ id: string; section: string }>;
}) {
  const { id, section } = await params;
  const project = await getBuildProject(id);
  if (!project) notFound();

  return (
    <div className="space-y-4">
      <div>
        <Link href="/build" className="text-sm text-accent hover:underline">
          ← Build
        </Link>
        <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-text-primary">{project.title}</h1>
            <p className="mt-1 text-sm capitalize text-text-secondary">{project.kind.replace(/_/g, " ")}</p>
          </div>
          <InlineStatusSelect
            value={project.status}
            options={BUILD_STATUSES}
            onChange={setBuildProjectStatus.bind(null, project.id)}
          />
        </div>
      </div>

      <BuildTabs projectId={project.id} />

      <div className="pt-2">
        {section === "overview" && (
          <div className="space-y-2 text-sm">
            <p className="text-text-secondary">
              Purpose: {project.purpose || <span className="italic">Not yet defined.</span>}
            </p>
            <p className="text-text-secondary">
              Success criteria: {project.success_criteria || <span className="italic">Not yet defined.</span>}
            </p>
          </div>
        )}

        {section === "design" && (
          <div className="space-y-3 text-sm">
            <p className="text-text-secondary">
              Requirements: {Object.keys(project.requirements ?? {}).length > 0
                ? JSON.stringify(project.requirements)
                : "None recorded."}
            </p>
            <p className="text-text-secondary">
              Detailed diagrams, CAD and specifications belong in Workspace as attached files.
            </p>
          </div>
        )}

        {section === "workspace" && <WorkspaceSection projectId={project.id} />}

        {section === "versions" && <VersionsSection projectId={project.id} />}

        {section === "problems" && <ProblemsSection projectId={project.id} />}

        {section === "testing" && <TestingSection projectId={project.id} />}
      </div>
    </div>
  );
}

async function WorkspaceSection({ projectId }: { projectId: string }) {
  const files = await listFilesForBuildProject(projectId);
  return (
    <div className="space-y-4">
      <BuildWorkspaceUploader buildProjectId={projectId} />
      {files.length === 0 ? (
        <EmptyState title="No files yet" description="Attach code, notebooks, CAD exports or datasets above." />
      ) : (
        <ul className="divide-y divide-border rounded-[var(--radius-card)] border border-border bg-panel">
          {files.map((f) => (
            <li key={f.id} className="flex items-center justify-between px-4 py-2.5 text-sm">
              <span className="text-text-primary">{f.file.filename}</span>
              <span className="text-xs text-text-secondary">
                {f.file.byte_size ? `${Math.round(f.file.byte_size / 1024)} KB` : ""}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

async function VersionsSection({ projectId }: { projectId: string }) {
  const versions = await listPrototypeVersions(projectId);
  return (
    <div className="space-y-4">
      <NewPrototypeVersionForm buildProjectId={projectId} />
      {versions.length === 0 ? (
        <EmptyState title="No versions yet" description="Add your first prototype version above." />
      ) : (
        <ul className="space-y-3">
          {versions.map((v) => (
            <li key={v.id} className="rounded-[var(--radius-card)] border border-border bg-panel p-4">
              <div className="flex items-center justify-between">
                <p className="font-medium text-text-primary">{v.version_label}</p>
                <StatusBadge status={v.status} />
              </div>
              {v.change_summary && <p className="mt-1 text-sm text-text-secondary">{v.change_summary}</p>}
              {v.design_notes && <p className="mt-1 text-xs text-text-secondary">{v.design_notes}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

async function ProblemsSection({ projectId }: { projectId: string }) {
  const [issues, versions] = await Promise.all([listBuildIssues(projectId), listPrototypeVersions(projectId)]);
  return (
    <div className="space-y-4">
      <NewBuildIssueForm buildProjectId={projectId} versions={versions} />
      {issues.length === 0 ? (
        <EmptyState title="No open problems" description="Log issues and attempted fixes here as they come up." />
      ) : (
        <ul className="space-y-3">
          {issues.map((i) => (
            <li key={i.id} className="rounded-[var(--radius-card)] border border-border bg-panel p-4">
              <div className="flex items-center justify-between">
                <p className="font-medium text-text-primary">{i.title}</p>
                <StatusBadge status={i.status} />
              </div>
              {i.observation && <p className="mt-1 text-sm text-text-secondary">{i.observation}</p>}
              {i.attempted_fixes && <p className="mt-1 text-xs text-text-secondary">Tried: {i.attempted_fixes}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

async function TestingSection({ projectId }: { projectId: string }) {
  const versions = await listPrototypeVersions(projectId);
  const tests = await listTestsForBuildProject(projectId, versions.map((v) => v.id));
  return (
    <div className="space-y-3">
      <Link
        href={`/test?buildProject=${projectId}`}
        className="inline-block rounded-lg bg-accent px-3 py-2 text-sm font-medium text-white hover:bg-accent-hover"
      >
        Create a test for a version
      </Link>
      {tests.length === 0 ? (
        <EmptyState title="No tests yet" description="Create a test linked to an exact prototype version." />
      ) : (
        <ul className="space-y-2">
          {tests.map((t) => (
            <li key={t.id}>
              <Link
                href={`/test/${t.id}`}
                className="flex items-center justify-between rounded-[var(--radius-card)] border border-border bg-panel p-3 text-sm hover:border-accent"
              >
                <span className="text-text-primary">{t.title}</span>
                <StatusBadge status={t.status} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
