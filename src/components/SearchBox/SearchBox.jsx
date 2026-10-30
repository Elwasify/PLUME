import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import useCatalog from "../../hooks/useCatalog";
import {
  search,
  suggest,
  searchAuthorsLocal,
  didYouMean,
} from "../../utils/engine";
import Highlight from "../Highlight/Highlight.jsx";
import { searchBooks } from "../../api/books";

const RECENT_KEY = "plume:recent-searches";
const RECENT_EVENT = "plume:recent-changed";

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

export default function SearchBox({
  className = "",
  onDone,
  variant = "nav",
  value,
  onChange,
  onSearch,
  onClear,
  placeholder = "Title, author, subject…",
}) {
  const navigate = useNavigate();
  const { ready } = useCatalog();
  const [term, setTerm] = useState("");
  const [debounced, setDebounced] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [remote, setRemote] = useState({ key: "", books: [] });
  const [recent, setRecent] = useState(loadRecent);
  const boxRef = useRef(null);

  const controlled = value !== undefined;
  const text = controlled ? value : term;
  const isPage = variant === "page";

  const changeText = (next) => {
    if (controlled) onChange?.(next);
    else setTerm(next);
  };

  useEffect(() => {
    const t = setTimeout(() => setDebounced(text), 200);
    return () => clearTimeout(t);
  }, [text]);

  useEffect(() => {
    const close = (e) => {
      if (!boxRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  useEffect(() => {
    const sync = () => setRecent(loadRecent());
    window.addEventListener(RECENT_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(RECENT_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const authors = useMemo(
    () => (ready ? searchAuthorsLocal(debounced, 2) : []),
    [ready, debounced],
  );
  const results = useMemo(
    () => (ready ? search(debounced).hits.slice(0, 6) : []),
    [ready, debounced],
  );
  const suggestions = useMemo(
    () => (ready ? suggest(debounced) : []),
    [ready, debounced],
  );
  const didYou = useMemo(
    () => (ready && results.length === 0 ? didYouMean(debounced) : ""),
    [ready, results, debounced],
  );

  const q = debounced.trim();
  const needsRemote = ready && q.length >= 3 && results.length < 6;

  useEffect(() => {
    if (!needsRemote) return;
    const ctrl = new AbortController();
    searchBooks({ q, limit: 6 }, ctrl.signal)
      .then((books) => {
        if (!ctrl.signal.aborted) setRemote({ key: q, books });
      })
      .catch((err) => {
        if (err.name !== "AbortError")
          console.error("remote search failed:", err);
      });
    return () => ctrl.abort();
  }, [needsRemote, q]);

  const remoteBooks = useMemo(() => {
    if (!needsRemote || remote.key !== q) return [];
    const ids = new Set(results.map((b) => b.id));
    return remote.books.filter((b) => !ids.has(b.id));
  }, [needsRemote, remote, q, results]);

  const items = useMemo(
    () => [
      ...authors.map((name) => ({ type: "author", name })),
      ...results.map((book) => ({ type: "book", book })),
      ...remoteBooks.map((book) => ({ type: "book", book })),
    ],
    [authors, results, remoteBooks],
  );

  const remember = (query) => {
    const t = query.trim();
    if (t.length < 2) return;
    const next = [
      t,
      ...loadRecent().filter((s) => s.toLowerCase() !== t.toLowerCase()),
    ].slice(0, 6);
    saveRecent(next);
    setRecent(next);
  };

  const removeRecent = (item) => {
    const next = loadRecent().filter((s) => s !== item);
    saveRecent(next);
    setRecent(next);
  };

  const clearRecent = () => {
    saveRecent([]);
    setRecent([]);
  };

  const finish = () => {
    if (!controlled) setTerm("");
    setActive(-1);
    setOpen(false);
    onDone?.();
  };

  const goSearch = (input) => {
    const query = input.trim();
    if (!query) return;
    if (onSearch) {
      onSearch(query);
    } else {
      remember(query);
      navigate(`/discover?q=${encodeURIComponent(query)}`);
    }
    finish();
  };
  const goBook = (book) => {
    remember(text);
    navigate(`/books/${book.id}`);
    finish();
  };

  const goAuthor = (name) => {
    remember(text);
    navigate(`/author/${encodeURIComponent(name)}`);
    finish();
  };
  const pick = (item) => {
    if (item.type === "author") goAuthor(item.name);
    else goBook(item.book);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (active >= 0 && items[active]) pick(items[active]);
    else goSearch(text);
  };

  const onKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((i) => Math.min(i + 1, items.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, -1));
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const hasQuery = text.trim().length >= 2;
  const showRecent = open && !hasQuery && recent.length > 0;
  const showBlur = open && !isPage && (hasQuery || showRecent);

  return (
    <>
      {showBlur && (
        <div
          aria-hidden="true"
          onMouseDown={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-ink/20 backdrop-blur-[1px]"
        />
      )}
      <div
        ref={boxRef}
        className={`relative ${showBlur ? "z-50" : ""} ${className}`}
      >
        <form
          role="search"
          onSubmit={onSubmit}
          className="flex items-center border-b border-ink/30 focus-within:border-burgundy"
        >
          <Icon
            icon="lucide:search"
            className={isPage ? "h-5 w-5 text-muted" : "h-4 w-4 text-muted"}
          />
          <input
            value={text}
            onChange={(e) => {
              changeText(e.target.value);
              setActive(-1);
              setOpen(true);
            }}
            onFocus={() => {
              setRecent(loadRecent());
              setOpen(true);
            }}
            onKeyDown={onKeyDown}
            placeholder={placeholder}
            aria-label="Search books and authors"
            autoComplete="off"
            className={
              isPage
                ? "w-full bg-transparent px-3 py-3 text-base outline-none placeholder:text-muted"
                : "w-full bg-transparent px-2 py-2 text-sm outline-none placeholder:text-muted"
            }
          />
          {isPage && text && onClear && (
            <button
              type="button"
              onClick={() => {
                onClear();
                setOpen(false);
              }}
              aria-label="Clear search"
              className="text-muted transition hover:text-burgundy"
            >
              <Icon icon="lucide:x" className="h-5 w-5" />
            </button>
          )}
        </form>

        {showRecent && (
          <div
            className={`absolute left-0 right-0 z-50 mt-1 overflow-hidden rounded-sm border border-line bg-cream shadow-lg ${
              isPage ? "" : "min-w-[280px]"
            }`}
          >
            <div className="flex items-center justify-between border-b border-line px-4 py-2">
              <span className="text-[11px] uppercase tracking-[0.2em] text-gold-deep">
                Recent searches
              </span>
              <button
                type="button"
                onClick={clearRecent}
                className="text-xs uppercase tracking-[0.15em] text-muted underline underline-offset-4 hover:text-burgundy"
              >
                Clear all
              </button>
            </div>
            <ul>
              {recent.map((item) => (
                <li key={item} className="flex items-center hover:bg-gold/10">
                  <button
                    type="button"
                    onClick={() => goSearch(item)}
                    className="flex min-w-0 flex-1 items-center gap-3 px-4 py-2.5 text-left text-sm"
                  >
                    <Icon
                      icon="lucide:clock"
                      className="h-4 w-4 shrink-0 text-muted"
                    />
                    <span className="truncate">{item}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => removeRecent(item)}
                    aria-label={`Remove ${item} from recent searches`}
                    className="flex h-10 w-10 shrink-0 items-center justify-center text-muted transition hover:text-burgundy"
                  >
                    <Icon icon="lucide:x" className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {open && hasQuery && (
          <div
            className={`absolute left-0 right-0 z-50 mt-1 overflow-hidden rounded-sm border border-line bg-cream shadow-lg ${
              isPage ? "" : "min-w-[280px]"
            }`}
          >
            {suggestions.length > 0 && (
              <div className="flex flex-wrap gap-2 border-b border-line p-3">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => changeText(s)}
                    className="rounded-full border border-line px-3 py-1 text-xs hover:border-gold hover:text-burgundy"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {items.length > 0 ? (
              <ul>
                {items.map((item, i) => (
                  <li
                    key={
                      item.type === "author" ? `a-${item.name}` : item.book.id
                    }
                  >
                    {item.type === "author" ? (
                      <button
                        type="button"
                        onMouseEnter={() => setActive(i)}
                        onClick={() => pick(item)}
                        className={`flex w-full items-center gap-3 px-4 py-2 text-left ${
                          i === active ? "bg-gold/15" : ""
                        }`}
                      >
                        <span className="flex h-12 w-8 shrink-0 items-center justify-center text-burgundy">
                          <Icon icon="lucide:user" className="h-5 w-5" />
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm">
                            <Highlight
                              text={item.name}
                              terms={text.trim().split(/\s+/)}
                            />
                          </span>
                          <span className="block truncate text-xs uppercase tracking-[0.2em] text-gold-deep">
                            Author
                          </span>
                        </span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onMouseEnter={() => setActive(i)}
                        onClick={() => pick(item)}
                        className={`flex w-full items-center gap-3 px-4 py-2 text-left ${
                          i === active ? "bg-gold/15" : ""
                        }`}
                      >
                        <img
                          src={item.book.volumeInfo.imageLinks?.thumbnail}
                          alt=""
                          className="h-12 w-8 shrink-0 rounded-sm object-cover"
                          onError={(e) => {
                            e.currentTarget.style.visibility = "hidden";
                          }}
                        />
                        <span className="min-w-0">
                          <span className="block truncate text-sm">
                            <Highlight
                              text={item.book.volumeInfo.title}
                              terms={item.book.terms}
                            />
                          </span>
                          <span className="block truncate text-xs text-muted">
                            <Highlight
                              text={item.book.volumeInfo.authors?.[0]}
                              terms={item.book.terms}
                            />
                          </span>
                        </span>
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="p-4 text-sm text-muted">
                {ready ? "No books found." : "Loading…"}
                {didYou && (
                  <>
                    {" "}
                    Did you mean{" "}
                    <button
                      type="button"
                      onClick={() => changeText(didYou)}
                      className="italic text-burgundy underline"
                    >
                      {didYou}
                    </button>
                    ?
                  </>
                )}
              </p>
            )}

            <button
              type="button"
              onClick={() => goSearch(text)}
              className="w-full border-t border-line px-4 py-3 text-left text-sm text-burgundy hover:bg-gold/10"
            >
              See all results for "{text}"
            </button>
          </div>
        )}
      </div>
    </>
  );
}