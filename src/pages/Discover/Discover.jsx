import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Icon } from "@iconify/react";
import BookCard from "../../components/BookCard/BookCard";
import AuthorCard from "../../components/AuthorCard/AuthorCard";
import categories from "../../data/categories";
import { searchBooksPage } from "../../api/books";
import { searchAuthors } from "../../api/authors";
import usePageTitle from "../../hooks/usePageTitle";

const LIMIT = 20;
const RECENT_KEY = "plume:recent-searches";

const SORTS = [
  { value: "", label: "Relevance" },
  { value: "newest", label: "Newest" },
  { value: "alphabetical", label: "A to Z" },
];

function hasMore(page, total, totalExact, received, limit) {
  const nextOffset = page * limit + received;
  if (totalExact && Number.isFinite(total)) return nextOffset < total;
  return received >= limit;
}

function sortBooks(books, sort) {
  if (sort !== "alphabetical") return books;
  return [...books].sort((a, b) =>
    (a.volumeInfo.title || "").localeCompare(
      b.volumeInfo.title || "",
      undefined,
      { sensitivity: "base" },
    ),
  );
}

function loadRecent() {
  try {
    const parsed = JSON.parse(localStorage.getItem(RECENT_KEY));
    return Array.isArray(parsed)
      ? parsed.filter((s) => typeof s === "string").slice(0, 6)
      : [];
  } catch {
    return [];
  }
}

function saveRecent(list) {
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(list));
  } catch {
    return;
  }
}

function Chip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`shrink-0 whitespace-nowrap border px-4 py-1.5 text-xs uppercase tracking-[0.15em] transition ${
        active
          ? "border-burgundy bg-burgundy text-cream"
          : "border-line hover:border-burgundy hover:text-burgundy"
      }`}
    >
      {children}
    </button>
  );
}

export default function Discover() {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";
  const sort = searchParams.get("sort") || "";

  const [draft, setDraft] = useState(null);
  const [recent, setRecent] = useState(loadRecent);
  const [retry, setRetry] = useState(0);
  const [data, setData] = useState({
    key: "",
    books: [],
    page: 0,
    done: false,
    total: null,
    totalExact: false,
    error: false,
  });
  const [authorsData, setAuthorsData] = useState({ key: "", list: [] });
  const [more, setMore] = useState({ key: "", loading: false, error: false });

  const fullKey = JSON.stringify([q, category, sort, retry]);
  const value = draft ?? q;
  const authorTerm = q.trim();
  const wantsAuthors = authorTerm.length >= 2 && !category;

  const update = useCallback(
    (changes) => {
      const next = new URLSearchParams(searchParams);
      Object.entries(changes).forEach(([k, v]) => {
        if (v) next.set(k, v);
        else next.delete(k);
      });
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  const remember = useCallback(
    (term) => {
      const t = term.trim();
      if (t.length < 2) return;
      const next = [
        t,
        ...loadRecent().filter((s) => s.toLowerCase() !== t.toLowerCase()),
      ].slice(0, 6);
      saveRecent(next);
      setRecent(next);
    },
    [setRecent],
  );

  usePageTitle(q ? `${q} — Discover` : "Discover");

  useEffect(() => {
    if (draft === null) return;
    const t = setTimeout(() => {
      update({ q: draft.trim() });
      remember(draft);
      setDraft(null);
    }, 450);
    return () => clearTimeout(t);
  }, [draft, update, remember]);

  useEffect(() => {
    const ctrl = new AbortController();

    searchBooksPage(
      {
        q,
        category,
        orderBy: sort === "alphabetical" ? "relevance" : sort || "relevance",
        offset: 0,
        limit: LIMIT,
      },
      ctrl.signal,
    )
      .then((result) => {
        if (ctrl.signal.aborted) return;
        setData({
          key: fullKey,
          books: result.books,
          page: 1,
          done: !hasMore(
            0,
            result.total,
            result.totalExact,
            result.received,
            LIMIT,
          ),
          total: result.total,
          totalExact: result.totalExact,
          error: false,
        });
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        setData({
          key: fullKey,
          books: [],
          page: 0,
          done: true,
          total: null,
          totalExact: false,
          error: true,
        });
      });

    return () => ctrl.abort();
  }, [q, category, sort, fullKey]);

  useEffect(() => {
    if (!wantsAuthors) return;
    const ctrl = new AbortController();

    searchAuthors(authorTerm, ctrl.signal, 3)
      .then((list) => {
        if (!ctrl.signal.aborted) {
          setAuthorsData({ key: authorTerm, list });
        }
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        setAuthorsData({ key: authorTerm, list: [] });
      });

    return () => ctrl.abort();
  }, [authorTerm, wantsAuthors]);

  const loading = data.key !== fullKey;
  const books = loading ? [] : sortBooks(data.books, sort);
  const authors =
    wantsAuthors && authorsData.key === authorTerm ? authorsData.list : [];
  const hasFilters = Boolean(q || category || sort);

  async function loadMore() {
    if ((more.key === fullKey && more.loading) || loading || data.done) return;
    setMore({ key: fullKey, loading: true, error: false });
    const key = fullKey;

    try {
      const result = await searchBooksPage({
        q,
        category,
        orderBy: sort === "alphabetical" ? "relevance" : sort || "relevance",
        offset: data.page * LIMIT,
        limit: LIMIT,
      });
      setData((prev) => {
        if (prev.key !== key) return prev;
        const ids = new Set(prev.books.map((b) => b.id));
        const fresh = result.books.filter((b) => {
          if (ids.has(b.id)) return false;
          ids.add(b.id);
          return true;
        });
        const nextPage = prev.page + 1;
        return {
          ...prev,
          books: [...prev.books, ...fresh],
          page: nextPage,
          done: !hasMore(
            prev.page,
            result.total,
            result.totalExact,
            result.received,
            LIMIT,
          ),
          total: result.total,
          totalExact: result.totalExact,
        };
      });
      setMore({ key, loading: false, error: false });
    } catch {
      setMore({ key, loading: false, error: true });
    }
  }

  const onSubmit = (e) => {
    e.preventDefault();
    update({ q: value.trim() });
    remember(value);
    setDraft(null);
  };

  const clearSearch = () => {
    setDraft(null);
    update({ q: "" });
  };

  const clearAll = () => {
    setDraft(null);
    setSearchParams({}, { replace: true });
  };

  const pickRecent = (term) => {
    setDraft(null);
    update({ q: term });
  };

  const clearRecent = () => {
    saveRecent([]);
    setRecent([]);
  };

  const heading = q ? (
    <>
      Results for <em className="text-burgundy">“{q}”</em>
    </>
  ) : category ? (
    <em className="text-burgundy">{category}</em>
  ) : (
    <>
      Discover <em className="text-burgundy">books</em>
    </>
  );

  return (
    <section className="mx-auto max-w-6xl px-6 py-12 md:py-20">
      <p className="text-[11px] uppercase tracking-[0.3em] text-gold-deep">
        Discover
      </p>
      <h1 className="mt-3 text-4xl md:text-5xl">{heading}</h1>

      <form
        role="search"
        onSubmit={onSubmit}
        className="mt-8 flex max-w-2xl items-center border-b border-ink/30 focus-within:border-burgundy"
      >
        <Icon icon="lucide:search" className="h-5 w-5 text-muted" />
        <input
          value={value}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Search by title, author or subject…"
          aria-label="Search books and authors"
          className="w-full bg-transparent px-3 py-3 text-base outline-none placeholder:text-muted"
        />
        {value && (
          <button
            type="button"
            onClick={clearSearch}
            aria-label="Clear search"
            className="text-muted transition hover:text-burgundy"
          >
            <Icon icon="lucide:x" className="h-5 w-5" />
          </button>
        )}
      </form>

      {!value && recent.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
          <span className="text-muted">Recent:</span>
          {recent.map((term) => (
            <button
              key={term}
              type="button"
              onClick={() => pickRecent(term)}
              className="border border-line px-3 py-1 transition hover:border-burgundy hover:text-burgundy"
            >
              {term}
            </button>
          ))}
          <button
            type="button"
            onClick={clearRecent}
            className="ml-1 text-xs uppercase tracking-[0.15em] text-muted underline underline-offset-4 hover:text-burgundy"
          >
            Clear
          </button>
        </div>
      )}

      <div className="mt-8 space-y-4">
        <div
          className="-mx-6 flex gap-2 overflow-x-auto px-6 pb-2"
          role="group"
          aria-label="Categories"
        >
          <Chip active={!category} onClick={() => update({ category: "" })}>
            All
          </Chip>
          {categories.map((c) => (
            <Chip
              key={c.name}
              active={category === c.name}
              onClick={() => update({ category: c.name })}
            >
              {c.name}
            </Chip>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <div
            className="flex flex-wrap items-center gap-2"
            role="group"
            aria-label="Sort"
          >
            {SORTS.map((s) => (
              <Chip
                key={s.value || "relevance"}
                active={sort === s.value}
                onClick={() => update({ sort: s.value })}
              >
                {s.label}
              </Chip>
            ))}
          </div>

          {hasFilters && (
            <button
              type="button"
              onClick={clearAll}
              className="text-xs uppercase tracking-[0.15em] text-burgundy underline decoration-gold underline-offset-4"
            >
              Clear all filters
            </button>
          )}
        </div>
      </div>

      {authors.length > 0 && (
        <section aria-labelledby="authors-heading" className="mt-12">
          <p className="text-[11px] uppercase tracking-[0.3em] text-gold-deep">
            Authors
          </p>
          <h2 id="authors-heading" className="mt-3 text-3xl md:text-4xl">
            Writers <em className="text-burgundy">matching</em> your search
          </h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
            {authors.map((author) => (
              <AuthorCard key={author.id} author={author} />
            ))}
          </div>
        </section>
      )}

      {authors.length > 0 && !loading && books.length > 0 && (
        <div className="mt-14">
          <p className="text-[11px] uppercase tracking-[0.3em] text-gold-deep">
            Books
          </p>
          <h2 className="mt-3 text-3xl md:text-4xl">
            Titles for <em className="text-burgundy">“{q}”</em>
          </h2>
        </div>
      )}

      {loading && (
        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-[2/3] animate-pulse bg-gold/20" />
          ))}
        </div>
      )}

      {!loading && data.error && (
        <div className="mt-10">
          <p className="text-burgundy">
            We could not load the books right now.
          </p>
          <button
            type="button"
            onClick={() => setRetry((r) => r + 1)}
            className="mt-4 border border-line px-5 py-2 text-xs uppercase tracking-[0.2em] transition hover:border-burgundy hover:text-burgundy"
          >
            Try again
          </button>
        </div>
      )}

      {!loading && !data.error && books.length === 0 && (
        <div className="mt-10 border border-line bg-white/50 px-6 py-14 text-center">
          <Icon
            icon="lucide:book-open"
            className="mx-auto h-8 w-8 text-gold-deep"
          />
          <h2 className="mt-4 text-2xl">No books found</h2>
          <p className="mt-2 text-muted">
            Try a different title, author or subject, or remove a filter.
          </p>
          {hasFilters && (
            <button
              type="button"
              onClick={clearAll}
              className="mt-6 bg-burgundy px-6 py-3 text-xs uppercase tracking-[0.2em] text-cream transition hover:bg-burgundy/90"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}

      {!loading && !data.error && books.length > 0 && (
        <>
          <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
            {books.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>

          <div className="mt-12 text-center">
            {more.key === fullKey && more.error && (
              <p className="mb-3 text-sm text-burgundy">
                We could not load more books.
              </p>
            )}
            {!data.done && (
              <button
                type="button"
                onClick={loadMore}
                disabled={more.key === fullKey && more.loading}
                className="border border-line px-8 py-3 text-xs uppercase tracking-[0.2em] transition hover:border-burgundy hover:text-burgundy disabled:opacity-50"
              >
                {more.key === fullKey && more.loading ? "Loading…" : "Load more"}
              </button>
            )}
          </div>
        </>
      )}
    </section>
  );
}
