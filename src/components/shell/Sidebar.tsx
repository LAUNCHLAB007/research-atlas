"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { WORKSPACE_NAV } from "@/lib/constants/nav";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-panel md:flex">
      <div className="flex h-16 items-center gap-2 px-5">
        <span className="h-2.5 w-2.5 rounded-full bg-accent" aria-hidden />
        <span className="font-semibold text-text-primary">Research Atlas</span>
      </div>
      <nav className="flex flex-1 flex-col gap-1 px-3 py-2">
        <NavLink href="/home" label="Home" active={pathname === "/home"} />
        <div className="mt-3 px-2 text-xs font-medium uppercase tracking-wide text-text-secondary">
          Workspaces
        </div>
        {WORKSPACE_NAV.map((item) => (
          <NavLink
            key={item.href}
            href={item.href}
            label={item.label}
            active={pathname === item.href || pathname.startsWith(item.href + "/")}
          />
        ))}
      </nav>
      <div className="border-t border-border px-3 py-2">
        <NavLink href="/settings" label="Settings" active={pathname === "/settings"} />
      </div>
    </aside>
  );
}

function NavLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        "rounded-lg px-3 py-2 text-sm font-medium transition",
        active ? "bg-accent-selected text-accent-hover" : "text-text-secondary hover:bg-inset hover:text-text-primary"
      )}
    >
      {label}
    </Link>
  );
}
