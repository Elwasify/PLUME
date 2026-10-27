import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Icon } from "@iconify/react";
import BookCard from "../../components/BookCard/BookCard";
import AuthorCard from "../../components/AuthorCard/AuthorCard";
import SearchBox from "../../components/SearchBox/SearchBox.jsx";
import categories from "../../data/categories";
import { searchBooksPage } from "../../api/books";
import { searchAuthors } from "../../api/authors";
import usePageTitle from "../../hooks/usePageTitle";
import useCatalog from "../../hooks/useCatalog";
import { search, didYouMean, searchAuthorsLocal } from "../../utils/engine";

const LIMIT = 20;
const LOCAL_PAGE = 12;
const EXTRA_MIN = 8;
const RECENT_KEY = "plume:recent-searches";
const RECENT_EVENT = "plume:recent-changed";

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

function sortBooks(books, sort, local = false) {
  if (sort === "alphabetical") {
    return [...books].sort((a, b) =>
      (a.volumeInfo.title || "").localeCompare(
        b.volumeInfo.title || "",
        undefined,
        { sensitivity: "base" },
      ),
    );
  }
  if (sort === "newest" && local) {
    const year = (b) => Number(b.volumeInfo.publishedDate) || 0;
    return [...books].sort((a, b) => year(b) - year(a));
  }
  return books;
}

function bookKey(book) {
  const info = book.volumeInfo || {};
  const title = (info.title || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  const author = ((info.authors && info.authors[0]) || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
  return `${title}|${author}`;
}

function mergeBooks(local, extra) {
  const ids = new Set(local.map((b) => b.id));
  const keys = new Set(local.map(bookKey));
  const result = [...local];
  const indexByKey = new Map();

  extra.forEach((book) => {
    const key = bookKey(book);
    if (ids.has(book.id)) return;

    if (keys.has(key)) {
      const at = indexByKey.get(key);
      if (at === undefined) return;
      const current = result[at];
      const currentHasCover = Boolean(current.volumeInfo?.imageLinks);
      const nextHasCover = Boolean(book.volumeInfo?.imageLinks);
      if (!currentHasCover && nextHasCover) {
        ids.add(book.id);
        result[at] = book;
      }
      return;
    }

    ids.add(book.id);
    keys.add(key);
    indexByKey.set(key, result.length);
    result.push(book);
  });

  return result;
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
  window.dispatchEvent(new Event(RECENT_EVENT));
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

  const { ready, error: catalogError, retry: retryCatalog } = useCatalog();
  const searching = q.trim().length >= 2;
  const useLocal = searching && ready;
  const catalogFailed = searching && !ready && catalogError;

  const [draft, setDraft] = useState(null);
  const [recent, setRecent] = useState(loadRecent);
  const [retry, setRetry] = useState(0);
  const [authorRetry, setAuthorRetry] = useState(0);
  const [shown, setShown] = useState({ key: "", count: LOCAL_PAGE });
  const [data, setData] = useState({
    key: "",
    books: [],
    page: 0,
    done: false,
    total: null,
    totalExact: false,
    error: false,
  });
  const [authorsData, setAuthorsData] = useState({
    key: "",
    list: [],
    error: false,
  });
  const [extra, setExtra] = useState({ key: "", books: [] });
  const [more, setMore] = useState({ key: "", loading: false, error: false });

  const fullKey = JSON.stringify([q, category, sort, retry]);
  const value = draft ?? q;
  const authorTerm = q.trim();
  const authorKey = JSON.stringify([authorTerm, authorRetry]);
  const wantsAuthors = authorTerm.length >= 2 && !category;

  const localResult = useMemo(
    () => (useLocal ? search(q, { category }) : { hits: [], facets: {} }),
    [useLocal, q, category],
  );

  const localBooks = localResult.hits;
  const needsExtra = useLocal && !category && localBooks.length < EXTRA_MIN;

  const facetList = useMemo(
    () => Object.entries(localResult.facets).sort((a, b) => b[1] - a[1]),
    [localResult],
  );

  const suggestion = useMemo(
    () =>
      useLocal && localBooks.length === 0 && !category ? didYouMean(q) : "",
    [useLocal, localBooks, category, q],
  );

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
    const sync = () => setRecent(loadRecent());
    window.addEventListener(RECENT_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(RECENT_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  useEffect(() => {
    if (draft === null) return;
    const t = setTimeout(() => {
      update({ q: draft.trim(), category: "" });
      remember(draft);
      setDraft(null);
    }, 450);
    return () => clearTimeout(t);
  }, [draft, update, remember]);

  useEffect(() => {
    if (searching) return;
    const ctrl = new AbortController();

    searchBooksPage(
      {
        q,
        category,
        orderBy: sort === "alphabetical" ? "title" : sort || "relevance",
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
  }, [q, category, sort, fullKey, searching]);

  useEffect(() => {
    if (!wantsAuthors) return;
    const ctrl = new AbortController();

    const localNames = ready ? searchAuthorsLocal(authorTerm, 2) : [];

    const localLookups = localNames.map((name) =>
      searchAuthors(name, ctrl.signal, 1)
        .then((found) =>
          found[0]
            ? found[0]
            : { id: `local-${name}`, name, description: "", thumbnail: "" },
        )
        .catch((err) => {
          if (err.name === "AbortError") throw err;
          return { id: `local-${name}`, name, description: "", thumbnail: "" };
        }),
    );

    Promise.all([
      Promise.all(localLookups),
      searchAuthors(authorTerm, ctrl.signal, 3),
    ])
      .then(([localList, wikiList]) => {
        if (ctrl.signal.aborted) return;
        const seen = new Set();
        const list = [...localList, ...wikiList]
          .filter((a) => {
            const key = a.name.toLowerCase();
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          })
          .slice(0, 4);
        setAuthorsData({ key: authorKey, list, error: false });
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        setAuthorsData({ key: authorKey, list: [], error: true });
      });

    return () => ctrl.abort();
  }, [authorKey, authorTerm, wantsAuthors, ready]);

  useEffect(() => {
    if (!needsExtra) return;
    const ctrl = new AbortController();

    searchBooksPage(
      {
        q,
        category: "",
        orderBy: "relevance",
        offset: 0,
        limit: LIMIT,
      },
      ctrl.signal,
    )
      .then((result) => {
        if (ctrl.signal.aborted) return;
        setExtra({ key: q, books: result.books });
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        setExtra({ key: q, books: [] });
      });

    return () => ctrl.abort();
  }, [needsExtra, q]);

  const extraLoading = needsExtra && extra.key !== q;
  const extraBooks = useMemo(
    () => (needsExtra && extra.key === q ? extra.books : []),
    [needsExtra, extra, q],
  );

  const mergedBooks = useMemo(
    () => mergeBooks(localBooks, extraBooks),
    [localBooks, extraBooks],
  );

  const loading = searching ? !ready && !catalogError : data.key !== fullKey;
  const sortedLocal = useMemo(
    () => sortBooks(mergedBooks, sort, true),
    [mergedBooks, sort],
  );
  const localCount = shown.key === fullKey ? shown.count : LOCAL_PAGE;
  const books = loading
    ? []
    : searching
      ? sortedLocal.slice(0, localCount)
      : data.books;
  const showSkeleton = loading || (extraLoading && books.length === 0);
  const apiError = !searching && data.error;
  const isDone = searching ? localCount >= sortedLocal.length : data.done;
  const authorsLoading = wantsAuthors && authorsData.key !== authorKey;
  const authors =
    wantsAuthors && authorsData.key === authorKey ? authorsData.list : [];
  const authorsError =
    wantsAuthors && authorsData.key === authorKey && authorsData.error;
  const hasFilters = Boolean(q || category || sort);
  const totalFacet = facetList.reduce((sum, [, n]) => sum + n, 0);
  const allCount = category ? totalFacet : mergedBooks.length;

  async function loadMore() {
    if (searching) {
      setShown({ key: fullKey, count: localCount + LOCAL_PAGE });
      return;
    }
    if ((more.key === fullKey && more.loading) || loading || isDone) return;
    setMore({ key: fullKey, loading: true, error: false });
    const key = fullKey;

    try {
      const result = await searchBooksPage({
        q,
        category,
        orderBy: sort === "alphabetical" ? "title" : sort || "relevance",
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

  const submitSearch = (text) => {
    update({ q: text.trim(), category: "" });
    remember(text);
    setDraft(null);
  };

  const clearSearch = () => {
    setDraft(null);
    update({ q: "", category: "" });
  };

  const clearAll = () => {
    setDraft(null);
    setSearchParams({}, { replace: true });
  };

  const pickRecent = (term) => {
    setDraft(null);
    update({ q: term, category: "" });
  };

  const pickCategory = (name) => {
    setDraft(null);
    setSearchParams({ category: name }, { replace: true });
  };

  const clearRecent = () => {
    saveRecent([]);
    setRecent([]);
  };

  const removeRecent = (term) => {
    const next = loadRecent().filter((s) => s !== term);
    saveRecent(next);
    setRecent(next);
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

      <SearchBox
        variant="page"
        className="mt-8 max-w-2xl"
        value={value}
        onChange={setDraft}
        onSearch={submitSearch}
        onClear={clearSearch}
        placeholder="Search by title, author or subject…"
      />

      {!value && recent.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
          <span className="text-muted">Recent:</span>
          {recent.map((term) => (
            <span
              key={term}
              className="inline-flex items-center border border-line transition hover:border-burgundy"
            >
              <button
                type="button"
                onClick={() => pickRecent(term)}
                className="px-3 py-1 transition hover:text-burgundy"
              >
                {term}
              </button>
              <button
                type="button"
                onClick={() => removeRecent(term)}
                aria-label={`Remove ${term} from recent searches`}
                className="flex h-full items-center px-2 text-muted transition hover:text-burgundy"
              >
                <Icon icon="lucide:x" className="h-3.5 w-3.5" />
              </button>
            </span>
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
          {searching ? (
            <>
              <Chip active={!category} onClick={() => update({ category: "" })}>
                All ({allCount})
              </Chip>
              {facetList.map(([name, count]) => (
                <Chip
                  key={name}
                  active={category === name}
                  onClick={() => update({ category: name })}
                >
                  {name} ({count})
                </Chip>
              ))}
            </>
          ) : (
            <>
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
            </>
          )}
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

      {authorsLoading && (
        <p
          className="mt-10 text-sm text-muted"
          role="status"
          aria-live="polite"
        >
          Looking for author matches…
        </p>
      )}

      {authorsError && (
        <div className="mt-10 text-sm">
          <p className="text-burgundy">
            Author matches could not be loaded. You can still browse the book
            results.
          </p>
          <button
            type="button"
            onClick={() => setAuthorRetry((value) => value + 1)}
            className="mt-3 border border-line px-4 py-2 text-xs uppercase tracking-[0.15em] transition hover:border-burgundy hover:text-burgundy"
          >
            Try author search again
          </button>
        </div>
      )}

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

      {showSkeleton && (
        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-[2/3] animate-pulse bg-gold/20" />
          ))}
        </div>
      )}

      {catalogFailed && (
        <div className="mt-10">
          <p className="text-burgundy">
            Search is unavailable right now. The book catalog could not be
            loaded.
          </p>
          <button
            type="button"
            onClick={retryCatalog}
            className="mt-4 border border-line px-5 py-2 text-xs uppercase tracking-[0.2em] transition hover:border-burgundy hover:text-burgundy"
          >
            Try again
          </button>
        </div>
      )}

      {!loading && apiError && (
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

      {!showSkeleton && !apiError && !catalogFailed && books.length === 0 && (
        <div className="mt-10 border border-line bg-white/50 px-6 py-14 text-center">
          <Icon
            icon="lucide:book-open"
            className="mx-auto h-8 w-8 text-gold-deep"
          />
          <h2 className="mt-4 text-2xl">No books found</h2>
          {suggestion && (
            <p className="mt-3 text-base">
              Did you mean{" "}
              <button
                type="button"
                onClick={() => {
                  setDraft(null);
                  update({ q: suggestion, category: "" });
                }}
                className="italic text-burgundy underline decoration-gold underline-offset-4"
              >
                {suggestion}
              </button>
              ?
            </p>
          )}
          <p className="mt-2 text-muted">
            Try a different title, author or subject, or remove a filter.
          </p>

          <div className="mx-auto mt-10 max-w-xl">
            <p className="text-[11px] uppercase tracking-[0.3em] text-gold-deep">
              Browse by category
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {categories.map((c) => (
                <Chip
                  key={c.name}
                  active={false}
                  onClick={() => pickCategory(c.name)}
                >
                  {c.name}
                </Chip>
              ))}
            </div>
          </div>

          {hasFilters && (
            <button
              type="button"
              onClick={clearAll}
              className="mt-8 bg-burgundy px-6 py-3 text-xs uppercase tracking-[0.2em] text-cream transition hover:bg-burgundy/90"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}

      {!loading && !apiError && books.length > 0 && (
        <>
          <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
            {books.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                terms={searching ? book.terms || [] : []}
              />
            ))}
          </div>

          {extraLoading && (
            <p
              className="mt-8 text-center text-sm text-muted"
              role="status"
              aria-live="polite"
            >
              Looking for more books…
            </p>
          )}

          <div className="mt-12 text-center">
            {!searching && more.key === fullKey && more.error && (
              <p className="mb-3 text-sm text-burgundy">
                We could not load more books.
              </p>
            )}
            {!isDone && (
              <button
                type="button"
                onClick={loadMore}
                disabled={!searching && more.key === fullKey && more.loading}
                className="border border-line px-8 py-3 text-xs uppercase tracking-[0.2em] transition hover:border-burgundy hover:text-burgundy disabled:opacity-50"
              >
                {!searching && more.key === fullKey && more.loading
                  ? "Loading…"
                  : "Load more"}
              </button>
            )}
          </div>
        </>
      )}
    </section>
  );
}
