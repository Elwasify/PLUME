import { Link } from "react-router-dom";
import { Icon } from "@iconify/react";

export default function AuthorCard({ author }) {
  const initials = author.name
    .split(" ")
    .map((word) => word[0])
    .slice(0, 2)
    .join("");

  return (
    <Link
      to={`/author/${encodeURIComponent(author.name)}`}
      aria-label={`View author ${author.name}`}
      className="group flex h-full gap-5 border border-line bg-white/40 p-5 transition-colors duration-300 hover:border-burgundy hover:bg-white/70 motion-reduce:transition-none"
    >
      <div className="h-28 w-24 shrink-0 overflow-hidden border border-gold/40 bg-secondary">
        {author.thumbnail ? (
          <img
            src={author.thumbnail}
            alt={`Portrait of ${author.name}`}
            loading="lazy"
            className="h-full w-full object-cover object-top"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center font-serif text-3xl text-burgundy">
            {initials}
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <p className="text-[11px] uppercase tracking-[0.3em] text-gold-deep">
          Author
        </p>
        <h3 className="mt-2 font-serif text-2xl leading-tight text-burgundy">
          {author.name}
        </h3>
        {author.description && (
          <p className="mt-2 font-serif text-sm italic text-muted">
            {author.description}
          </p>
        )}
        <span className="mt-auto inline-flex items-center gap-2 pt-4 text-[11px] uppercase tracking-[0.3em] text-gold-deep transition-colors group-hover:text-burgundy">
          View author
          <Icon
            icon="lucide:arrow-right"
            className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
          />
        </span>
      </div>
    </Link>
  );
}
