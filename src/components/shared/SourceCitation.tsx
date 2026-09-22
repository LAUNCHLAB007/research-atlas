import type { Source } from "@/lib/types/domain";

export function SourceCitation({ source }: { source: Pick<Source, "title" | "authors" | "publication_year" | "url" | "doi"> }) {
  const authorLine = source.authors && source.authors.length > 0 ? source.authors.join(", ") : null;
  const link = source.url ?? (source.doi ? `https://doi.org/${source.doi}` : null);

  return (
    <div className="text-sm">
      <p className="font-medium text-text-primary">{source.title}</p>
      <p className="text-text-secondary">
        {[authorLine, source.publication_year].filter(Boolean).join(" · ")}
      </p>
      {link ? (
        <a
          href={link}
          target="_blank"
          rel="noreferrer"
          className="text-accent hover:text-accent-hover hover:underline"
        >
          Open original
        </a>
      ) : (
        <span className="text-caution">Link unavailable</span>
      )}
    </div>
  );
}
