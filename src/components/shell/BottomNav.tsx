"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/cn";

const PRIMARY_ITEMS = [
  { href: "/home", label: "Home" },
  { href: "/explore", label: "Explore" },
  { href: "/classroom", label: "Class" },
  { href: "/research", label: "Research" },
];

const MORE_ITEMS = [
  { href: "/build", label: "Build" },
  { href: "/test", label: "Test" },
  { href: "/library", label: "Library" },
];

export function BottomNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreActive = MORE_ITEMS.some((item) => pathname.startsWith(item.href));

  return (
    <>
      {moreOpen && (
        <div className="fixed inset-0 z-20 bg-black/20 md:hidden" onClick={() => setMoreOpen(false)}>
          <div
            className="absolute inset-x-0 bottom-14 rounded-t-[var(--radius-dialog)] border-t border-border bg-panel p-2 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            {MORE_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMoreOpen(false)}
                className="block rounded-lg px-4 py-3 text-sm font-medium text-text-primary hover:bg-inset"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
      <nav className="fixed inset-x-0 bottom-0 z-20 flex border-t border-border bg-panel md:hidden">
        {PRIMARY_ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs font-medium",
                active ? "text-accent" : "text-text-secondary"
              )}
            >
              <span className={cn("h-1.5 w-1.5 rounded-full", active ? "bg-accent" : "bg-transparent")} aria-hidden />
              {item.label}
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => setMoreOpen((v) => !v)}
          className={cn(
            "flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs font-medium",
            moreActive ? "text-accent" : "text-text-secondary"
          )}
        >
          <span className={cn("h-1.5 w-1.5 rounded-full", moreActive ? "bg-accent" : "bg-transparent")} aria-hidden />
          More
        </button>
      </nav>
    </>
  );
}
