import Link from "next/link";

export interface LinkedRecordItem {
  href: string;
  label: string;
  type: string;
}

export function LinkedRecords({ items, emptyLabel }: { items: LinkedRecordItem[]; emptyLabel: string }) {
  if (items.length === 0) {
    return <p className="text-sm text-text-secondary">{emptyLabel}</p>;
  }
  return (
    <ul className="divide-y divide-border rounded-[var(--radius-card)] border border-border bg-panel">
      {items.map((item) => (
        <li key={item.href}>
          <Link href={item.href} className="flex items-center justify-between px-4 py-2.5 text-sm hover:bg-inset">
            <span className="text-text-primary">{item.label}</span>
            <span className="text-xs uppercase tracking-wide text-text-secondary">{item.type}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
