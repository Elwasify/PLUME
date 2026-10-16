import { useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import JournalCard from "../../components/JournalCard/JournalCard";
import { journalArticles } from "../../data/journalArticles";
import usePageTitle from "../../hooks/usePageTitle";

const PAGE_SIZE = 6;

function CategoryChip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`shrink-0 border px-4 py-2 text-[11px] uppercase tracking-[0.16em] transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-burgundy ${
        active
          ? "border-burgundy bg-burgundy text-cream"
          : "border-line hover:border-burgundy hover:text-burgundy"
      }`}
    >
      {children}
    </button>
  );
}

export default function Journal() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("newest");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  usePageTitle("Le Journal");

  const categories = useMemo(
    () => [...new Set(journalArticles.map((article) => article.category))],
    [],
  );
  const filtered = useMemo(() => {
    const term = query.trim().toLocaleLowerCase();
    return journalArticles
      .filter((article) => !category || article.category === category)
      .filter((article) => {
        if (!term) return true;
        const body = article.sections
          .flatMap((section) => [section.title, ...section.paragraphs])
          .join(" ");
        return [article.title, article.subtitle, article.excerpt, article.category, body]
          .join(" ")
          .toLocaleLowerCase()
          .includes(term);
      })
      .sort((a, b) => {
        const direction = sort === "oldest" ? 1 : -1;
        return direction * a.publishedAt.localeCompare(b.publishedAt);
      });
  }, [category, query, sort]);

  const clearFilters = () => {
    setQuery("");
    setCategory("");
    setSort("newest");
    setVisibleCount(PAGE_SIZE);
  };

  return (
    <>
      <section className="border-b border-line bg-secondary/40">
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
          <p className="text-[11px] uppercase tracking-[0.3em] text-gold-deep">
            Stories for curious readers
          </p>
          <h1 className="mt-4 max-w-4xl font-serif text-5xl leading-tight md:text-7xl">
            Le <em className="text-burgundy">Journal</em>
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted md:text-lg">
            Essays on the books, writers and ideas that stay with us. Read a
            story, meet a new author, and follow its threads back to the library.
          </p>
          <p className="mt-6 text-[11px] uppercase tracking-[0.25em] text-gold-deep">
            Literature · Memory · The reading life
          </p>
        </div>
      </section>

      <section
        aria-labelledby="journal-articles-heading"
        className="mx-auto max-w-6xl px-6 py-14 md:py-20"
      >
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-gold-deep">
              The latest pages
            </p>
            <h2 id="journal-articles-heading" className="mt-3 font-serif text-3xl md:text-4xl">
              Read <em className="text-burgundy">Le Journal</em>
            </h2>
          </div>
          <label className="flex w-full max-w-md items-center border-b border-ink/30 focus-within:border-burgundy">
            <Icon icon="lucide:search" className="h-5 w-5 text-muted" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search stories and subjects…"
              aria-label="Search journal articles"
              className="w-full bg-transparent px-3 py-3 text-sm outline-none placeholder:text-muted focus-visible:ring-2 focus-visible:ring-burgundy/40"
            />
          </label>
        </div>

        <div className="mt-8 flex flex-col gap-4">
          <div className="-mx-6 flex gap-2 overflow-x-auto px-6 pb-2" role="group" aria-label="Journal categories">
            <CategoryChip active={!category} onClick={() => setCategory("")}>All stories</CategoryChip>
            {categories.map((item) => (
              <CategoryChip
                key={item}
                active={category === item}
                onClick={() => setCategory(item)}
              >
                {item}
              </CategoryChip>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 text-xs uppercase tracking-[0.15em] text-muted">
              Publication date
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value)}
                className="border border-line bg-cream px-3 py-2 text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-burgundy"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
              </select>
            </label>
            {(query || category || sort !== "newest") && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-xs uppercase tracking-[0.15em] text-burgundy underline decoration-gold underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-burgundy"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="mt-10 border border-line bg-white/50 px-6 py-14 text-center">
            <Icon icon="lucide:book-open-text" className="mx-auto h-8 w-8 text-gold-deep" />
            <h3 className="mt-4 font-serif text-2xl">No stories found</h3>
            <p className="mt-2 text-sm text-muted">
              Try another title or subject, or clear the filters to browse every article.
            </p>
            <button
              type="button"
              onClick={clearFilters}
              className="mt-6 bg-burgundy px-6 py-3 text-xs uppercase tracking-[0.2em] text-cream transition hover:bg-burgundy/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-burgundy"
            >
              Show all stories
            </button>
          </div>
        ) : (
          <>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.slice(0, visibleCount).map((article) => (
                <JournalCard key={article.id} article={article} />
              ))}
            </div>
            {visibleCount < filtered.length && (
              <div className="mt-12 text-center">
                <button
                  type="button"
                  onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
                  className="border border-line px-8 py-3 text-xs uppercase tracking-[0.2em] transition hover:border-burgundy hover:text-burgundy focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-burgundy"
                >
                  Load more stories
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </>
  );
}
