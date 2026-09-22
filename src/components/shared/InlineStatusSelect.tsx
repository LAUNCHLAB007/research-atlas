"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ActionResult } from "@/lib/actions/shared";

export function InlineStatusSelect({
  value,
  options,
  onChange,
}: {
  value: string;
  options: string[];
  onChange: (next: string) => Promise<ActionResult<unknown>>;
}) {
  const [current, setCurrent] = useState(value);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <select
      value={current}
      disabled={pending}
      onChange={(e) => {
        const next = e.target.value;
        setCurrent(next);
        startTransition(async () => {
          await onChange(next);
          router.refresh();
        });
      }}
      className="rounded-lg border border-border bg-panel px-2.5 py-1.5 text-sm capitalize outline-none focus:border-accent"
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {o.replace(/_/g, " ")}
        </option>
      ))}
    </select>
  );
}
