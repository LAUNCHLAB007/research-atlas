"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

const SECTIONS = [
  { key: "overview", label: "Overview" },
  { key: "background", label: "Background" },
  { key: "evidence", label: "Evidence" },
  { key: "hypotheses", label: "Hypotheses" },
  { key: "experiment-plans", label: "Experiment plans" },
  { key: "notebook", label: "Notebook" },
  { key: "results", label: "Results" },
];

export function ResearchTabs({ projectId }: { projectId: string }) {
  const pathname = usePathname();
  return (
    <nav className="flex gap-1 overflow-x-auto border-b border-border">
      {SECTIONS.map((s) => {
        const href = `/research/${projectId}/${s.key}`;
        const active = pathname === href;
        return (
          <Link
            key={s.key}
            href={href}
            className={cn(
              "shrink-0 border-b-2 px-3 py-2 text-sm font-medium",
              active ? "border-accent text-accent" : "border-transparent text-text-secondary hover:text-text-primary"
            )}
          >
            {s.label}
          </Link>
        );
      })}
    </nav>
  );
}
