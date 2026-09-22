import { listClassrooms } from "@/lib/data/classroom";
import { RecordCard } from "@/components/shared/RecordCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { NewClassroomForm } from "@/components/classroom/NewClassroomForm";

export default async function ClassroomHomePage() {
  const classrooms = await listClassrooms();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">Classroom</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Collect lectures and courses across all five domains. No deadlines, no streaks.
          </p>
        </div>
        <NewClassroomForm />
      </div>

      {classrooms.length === 0 ? (
        <EmptyState
          title="No classrooms yet"
          description="Create a classroom, then add lecture or course links to it."
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {classrooms.map((c) => (
            <RecordCard
              key={c.id}
              href={`/classroom/${c.id}`}
              title={c.title}
              subtitle={c.learning_goal || c.description}
              updatedAt={c.updated_at}
            />
          ))}
        </div>
      )}
    </div>
  );
}
