import Link from "next/link";
import { notFound } from "next/navigation";
import { getClassroom, listLectures } from "@/lib/data/classroom";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { AddLectureForm } from "@/components/classroom/AddLectureForm";

export default async function ClassroomDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const classroom = await getClassroom(id);
  if (!classroom) notFound();

  const lectures = await listLectures(id);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/classroom" className="text-sm text-accent hover:underline">
          ← Classroom
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-text-primary">{classroom.title}</h1>
        {classroom.learning_goal && <p className="mt-1 text-sm text-text-secondary">Goal: {classroom.learning_goal}</p>}
        {classroom.description && <p className="mt-1 text-sm text-text-secondary">{classroom.description}</p>}
      </div>

      <AddLectureForm classroomId={classroom.id} />

      {lectures.length === 0 ? (
        <EmptyState title="No lectures yet" description="Add a lecture, playlist or course URL above." />
      ) : (
        <ul className="divide-y divide-border rounded-[var(--radius-card)] border border-border bg-panel">
          {lectures.map((l) => (
            <li key={l.id}>
              <Link href={`/classroom/lectures/${l.id}`} className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-inset">
                <div className="min-w-0">
                  <p className="truncate font-medium text-text-primary">{l.source.title}</p>
                  <p className="truncate text-xs text-text-secondary">{l.source.provider || l.source.url}</p>
                </div>
                <StatusBadge status={l.status} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
