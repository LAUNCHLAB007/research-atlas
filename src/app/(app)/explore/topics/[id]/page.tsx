import Link from "next/link";
import { notFound } from "next/navigation";
import { LEARNING_DOMAINS, domainById } from "@/lib/constants/domains";
import { listTopicsByDomain, getTopic, listSubtopics, resolveTopicLinkItems } from "@/lib/data/topics";
import { LinkedRecords } from "@/components/shared/LinkedRecords";
import { EmptyState } from "@/components/shared/EmptyState";
import { NewTopicForm } from "@/components/explore/NewTopicForm";
import type { LearningDomainId } from "@/lib/types/domain";

const DOMAIN_IDS = new Set([1, 2, 3, 4, 5]);

export default async function TopicLandingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (DOMAIN_IDS.has(Number(id))) {
    const domainId = Number(id) as LearningDomainId;
    const domain = domainById(domainId);
    const topics = await listTopicsByDomain(domainId);
    const rootTopics = topics.filter((t) => t.parent_id === null);

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full" style={{ background: domain.colorVar }} aria-hidden />
          <h1 className="text-2xl font-semibold text-text-primary">{domain.name}</h1>
        </div>
        <p className="max-w-2xl text-sm text-text-secondary">{domain.description}</p>

        <section>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-text-primary">Subtopics</h2>
          </div>
          <div className="mt-3">
            <NewTopicForm domainId={domainId} />
          </div>
          {rootTopics.length === 0 ? (
            <div className="mt-3">
              <EmptyState title="No subtopics yet" description="Add a subtopic above to start organizing this domain." />
            </div>
          ) : (
            <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {rootTopics.map((t) => (
                <li key={t.id}>
                  <Link
                    href={`/explore/topics/${t.id}`}
                    className="block rounded-[var(--radius-card)] border border-border bg-panel p-3 text-sm font-medium text-text-primary hover:border-accent"
                  >
                    {t.name}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className="text-lg font-medium text-text-primary">Related domains</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {LEARNING_DOMAINS.filter((d) => d.id !== domainId).map((d) => (
              <Link
                key={d.id}
                href={`/explore/topics/${d.id}`}
                className="rounded-full border border-border px-3 py-1.5 text-sm text-text-secondary hover:border-accent hover:text-accent"
              >
                {d.name}
              </Link>
            ))}
          </div>
        </section>
      </div>
    );
  }

  const topic = await getTopic(id);
  if (!topic) notFound();

  const [domain, subtopics, linkedItems] = await Promise.all([
    domainById(topic.domain_id),
    listSubtopics(topic.id),
    resolveTopicLinkItems(topic.id),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <Link href={`/explore/topics/${topic.domain_id}`} className="text-sm text-accent hover:underline">
          ← {domain.name}
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-text-primary">{topic.name}</h1>
        {topic.description && <p className="mt-1 max-w-2xl text-sm text-text-secondary">{topic.description}</p>}
      </div>

      <section>
        <h2 className="text-lg font-medium text-text-primary">Subtopics</h2>
        <div className="mt-3">
          <NewTopicForm domainId={topic.domain_id} parentId={topic.id} />
        </div>
        {subtopics.length === 0 ? (
          <p className="mt-2 text-sm text-text-secondary">No subtopics yet.</p>
        ) : (
          <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {subtopics.map((t) => (
              <li key={t.id}>
                <Link
                  href={`/explore/topics/${t.id}`}
                  className="block rounded-[var(--radius-card)] border border-border bg-panel p-3 text-sm font-medium text-text-primary hover:border-accent"
                >
                  {t.name}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-lg font-medium text-text-primary">Linked records</h2>
        <div className="mt-3">
          <LinkedRecords items={linkedItems} emptyLabel="Nothing links to this topic yet." />
        </div>
      </section>
    </div>
  );
}
