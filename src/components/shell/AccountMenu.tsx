"use client";

import { useState } from "react";
import { signOut } from "@/lib/actions/auth";
import Link from "next/link";

export function AccountMenu({ email }: { email: string | null }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-selected text-sm font-semibold text-accent-hover"
      >
        {(email?.[0] ?? "?").toUpperCase()}
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 rounded-[var(--radius-card)] border border-border bg-panel p-2 shadow-lg">
          <p className="truncate px-2 py-1.5 text-xs text-text-secondary">{email}</p>
          <Link
            href="/settings"
            onClick={() => setOpen(false)}
            className="block rounded-lg px-2 py-1.5 text-sm text-text-primary hover:bg-inset"
          >
            Settings
          </Link>
          <form action={signOut}>
            <button
              type="submit"
              className="block w-full rounded-lg px-2 py-1.5 text-left text-sm text-error hover:bg-inset"
            >
              Sign out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
