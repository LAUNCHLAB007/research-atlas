import Link from "next/link";
import { StatusBadge } from "./StatusBadge";
import { ProvenanceBadge } from "./ProvenanceBadge";
import type { Provenance } from "@/lib/types/domain";

export interface RecordCardProps {
  href: string;
  title: string;
  subtitle?: string | null;
  status?: string | null;
  provenance?: Provenance | null;
  updatedAt?: string | null;
  meta?: string | null;
}

export function RecordCard({ href, title, subtitle, status, provenance, updatedAt, meta }: RecordCardProps) {
  return (
    <Link
      href={href}
      className="block rounded-[var(--radius-card)] border border-border bg-panel p-4 transition hover:border-accent hover:shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-medium text-text-primary">{title}</h3>
        {status && <StatusBadge status={status} />}
      </div>
      {subtitle && <p className="mt-1 line-clamp-2 text-sm text-text-secondary">{subtitle}</p>}
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-text-secondary">
        {provenance && <ProvenanceBadge provenance={provenance} />}
        {meta && <span>{meta}</span>}
        {updatedAt && <span>Updated {new Date(updatedAt).toLocaleDateString()}</span>}
      </div>
    </Link>
  );
}
