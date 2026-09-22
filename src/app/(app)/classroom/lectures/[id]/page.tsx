import Link from "next/link";
import { notFound } from "next/navigation";
import { getLecture, listLectureNotes } from "@/lib/data/classroom";
import { LectureStatusSelect } from "@/components/classroom/LectureStatusSelect";
import { NewLectureNoteForm } from "@/components/classroom/NewLectureNoteForm";
import { SaveQuestionForm } from "@/components/classroom/SaveQuestionForm";

export default async function LectureViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lecture = await getLecture(id);
  if (!lecture) notFound();

  const notes = await listLectureNotes(id);

  return (
    <div className="space-y-6">
      <div>
        <Link href={`/classroom/${lecture.classroom_id}`} className="text-sm text-accent hover:underline">
          ← Classroom
        </Link>
        <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
          <h1 className="text-xl font-semibold text-text-primary">{lecture.source.title}</h1>
          <LectureStatusSelect lectureId={lecture.id} classroomId={lecture.classroom_id} status={lecture.status} />
        </div>
        {lecture.source.provider && <p className="text-sm text-text-secondary">{lecture.source.provider}</p>}
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-4">
          <div className="flex aspect-video items-center justify-center rounded-[var(--radius-card)] border border-border bg-panel">
            {lecture.source.url ? (
              <a
                href={lecture.source.url}
                target="_blank"
                rel="noreferrer"
                className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover"
              >
                Open original lecture
              </a>
            ) : (
              <p className="text-sm text-text-secondary">No link recorded for this source.</p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <SaveQuestionForm lectureId={lecture.id} />
            <Link
              href="/research"
              className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-text-primary hover:border-accent hover:text-accent"
            >
              Link to Research
            </Link>
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-sm font-medium text-text-primary">Notes</h2>
          <NewLectureNoteForm lectureId={lecture.id} />
          <ul className="space-y-2">
            {notes.map((n) => (
              <li key={n.id} className="rounded-[var(--radius-card)] border border-border bg-panel p-3 text-sm">
                <div className="flex items-center justify-between text-xs text-text-secondary">
                  <span className="capitalize">{n.kind}</span>
                  {n.video_second !== null && <span>{n.video_second}s</span>}
                </div>
                <p className="mt-1 text-text-primary">{n.body}</p>
              </li>
            ))}
            {notes.length === 0 && <p className="text-sm text-text-secondary">No notes yet.</p>}
          </ul>
        </div>
      </div>
    </div>
  );
}
