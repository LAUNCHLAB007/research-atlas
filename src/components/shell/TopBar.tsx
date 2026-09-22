import { GlobalSearch } from "./GlobalSearch";
import { QuickCapture } from "./QuickCapture";
import { AccountMenu } from "./AccountMenu";
import type { Topic } from "@/lib/types/domain";

export function TopBar({ topics, email }: { topics: Topic[]; email: string | null }) {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-border bg-panel/95 px-4 backdrop-blur md:px-6">
      <div className="flex-1" />
      <GlobalSearch />
      <QuickCapture topics={topics} />
      <AccountMenu email={email} />
    </header>
  );
}
