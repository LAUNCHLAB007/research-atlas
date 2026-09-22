"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function GlobalSearch() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/library?q=${encodeURIComponent(query.trim())}`);
  }

  return (
    <form onSubmit={submit} className="hidden flex-1 max-w-md sm:block">
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search your records…"
        className="w-full rounded-lg border border-border bg-canvas px-3 py-2 text-sm outline-none focus:border-accent"
      />
    </form>
  );
}
