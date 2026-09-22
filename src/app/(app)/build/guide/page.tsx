import Link from "next/link";
import { getEntry } from "@/lib/data/entries";
import { BuildGuideForm } from "@/components/build/BuildGuideForm";

export default async function BuildGuidePage({
  searchParams,
}: {
  searchParams: Promise<{ fromEntry?: string }>;
}) {
  const { fromEntry } = await searchParams;
  const entry = fromEntry ? await getEntry(fromEntry) : null;

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div>
        <Link href="/build" className="text-sm text-accent hover:underline">
          ← Build
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-text-primary">Build Guide</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Define the problem, check what already exists, and choose the smallest meaningful prototype. If it turns
          out a prototype is premature, take what you write here back to Classroom or Research instead.
        </p>
      </div>
      <BuildGuideForm initialProblem={entry?.body} />
    </div>
  );
}
