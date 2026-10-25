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

  const items = useMemo(
    () => [
      ...authors.map((name) => ({ type: "author", name })),
      ...results.map((book) => ({ type: "book", book })),
    ],
    [authors, results],
  );

  const finish = () => {
    if (!controlled) setTerm("");
    setActive(-1);
    setOpen(false);
    onDone?.();
  };

  const goSearch = (input) => {
    const q = input.trim();
    if (!q) return;
    if (onSearch) onSearch(q);
    else navigate(`/discover?q=${encodeURIComponent(q)}`);
    finish();
  };

  const goBook = (book) => {
    navigate(`/books/${book.id}`);
    finish();
  };

  const goAuthor = (name) => {
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

  return (
    <div ref={boxRef} className={`relative ${className}`}>
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
          onFocus={() => setOpen(true)}
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
                  key={item.type === "author" ? `a-${item.name}` : item.book.id}
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
  );
}