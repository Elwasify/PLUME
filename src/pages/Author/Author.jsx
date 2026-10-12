import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Icon } from "@iconify/react";
import BookCard from "../../components/BookCard/BookCard";
import { authorQuery, searchBooks } from "../../api/books";
import { searchAuthors } from "../../api/authors";
import usePageTitle from "../../hooks/usePageTitle";

const WRITER_RE =
  /writer|author|novelist|poet|playwright|dramatist|essayist|philosopher|journalist|historian|critic|short story/i;

async function fetchSummary(title, signal) {
  const res = await fetch(
    `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
      title.replace(/ /g, "_"),
    )}`,
    { signal },
  );
  if (!res.ok) return null;
  const d = await res.json();
  if (d.type === "disambiguation") return null;
  if (!WRITER_RE.test(d.description || "")) return null;
  return d;
}

async function fetchBio(name, signal) {
  const titles = [name, `${name} (writer)`, `${name} (author)`];
  for (const t of titles) {
    try {
      const d = await fetchSummary(t, signal);
      if (d) return d;
    } catch (e) {
      if (e.name === "AbortError") throw e;
    }
  }

  try {
    const found = await searchAuthors(name, signal, 1);
    if (found[0]) return await fetchSummary(found[0].name, signal);
  } catch (e) {
    if (e.name === "AbortError") throw e;
  }

  return null;
}

async function fetchWorks(name, signal) {
  const list = await searchBooks(
    { q: authorQuery(name), limit: 40 },
    signal,
  );
  const normalize = (value) =>
    value
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();
  const lower = normalize(name);
  const seen = new Set();
  return list.filter((b) => {
    const info = b.volumeInfo || {};
    const byAuthor = (info.authors || []).some(
      (a) => typeof a === "string" && normalize(a) === lower,
    );
    const t = (info.title || "").toLowerCase().trim();
    if (!byAuthor || !t || seen.has(t)) return false;
    seen.add(t);
    return true;
  });
}

export default function Author() {
  const { name } = useParams();
  const [retry, setRetry] = useState(0);
  const key = `${name}::${retry}`;

  const [bioRes, setBioRes] = useState({ key: "", data: null });
  const [booksRes, setBooksRes] = useState({ key: "", list: [], error: false });

  useEffect(() => {
    window.scrollTo(0, 0);
    const ctrl = new AbortController();

    fetchBio(name, ctrl.signal)
      .then((data) => {
        if (!ctrl.signal.aborted) setBioRes({ key, data });
      })
      .catch((e) => {
        if (e.name !== "AbortError") setBioRes({ key, data: null });
      });

    fetchWorks(name, ctrl.signal)
      .then((list) => {
        if (!ctrl.signal.aborted) setBooksRes({ key, list, error: false });
      })
      .catch((e) => {
        if (e.name !== "AbortError")
          setBooksRes({ key, list: [], error: true });
      });

    return () => ctrl.abort();
  }, [name, key]);

  const bioLoading = bioRes.key !== key;
  const bio = bioLoading ? null : bioRes.data;
  usePageTitle(bio?.title || name || "Author");
  const booksLoading = booksRes.key !== key;
  const books = booksLoading ? [] : booksRes.list;
  const booksError = !booksLoading && booksRes.error;

  const portrait = bio?.thumbnail?.source;
  const wikiUrl = bio?.content_urls?.desktop?.page;
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("");

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 md:py-20">
      <Link
        to="/discover"
        className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted transition hover:text-burgundy"
      >
        <Icon icon="lucide:arrow-left" className="h-4 w-4" />
        Back to discover
      </Link>

      <section className="mt-10 grid gap-10 md:grid-cols-[280px_1fr] md:gap-14">
        <div>
          {bioLoading ? (
            <div className="aspect-[3/4] animate-pulse bg-gold/20" />
          ) : portrait ? (
            <img
              src={portrait}
              alt={`Portrait of ${name}`}
              className="aspect-[3/4] w-full border border-gold/40 object-cover"
            />
          ) : (
            <div className="flex aspect-[3/4] w-full items-center justify-center border border-gold/40 bg-white/50 font-serif text-6xl text-burgundy">
              {initials}
            </div>
          )}
        </div>

        <div>
          <p className="text-[11px] uppercase tracking-[0.3em] text-gold-deep">
            Author
          </p>
          <h1 className="mt-3 text-4xl leading-tight md:text-6xl">{name}</h1>

          {bioLoading ? (
            <div className="mt-8 space-y-3">
              <div className="h-4 w-2/3 animate-pulse bg-gold/20" />
              <div className="h-4 w-full animate-pulse bg-gold/20" />
              <div className="h-4 w-5/6 animate-pulse bg-gold/20" />
            </div>
          ) : bio ? (
            <>
              {bio.description && (
                <p className="mt-4 font-serif text-lg italic text-burgundy">
                  {bio.description}
                </p>
              )}
              <p className="mt-6 max-w-2xl leading-relaxed text-muted">
                {bio.extract}
              </p>
              {wikiUrl && (
                <a
                  href={wikiUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-6 inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-burgundy underline decoration-gold underline-offset-8"
                >
                  Read more on Wikipedia
                  <Icon icon="lucide:external-link" className="h-3.5 w-3.5" />
                </a>
              )}
            </>
          ) : (
            <p className="mt-6 max-w-2xl leading-relaxed text-muted">
              We don’t have a verified biography for this author yet.
            </p>
          )}
        </div>
      </section>

      <section className="mt-16 border-t border-line pt-12 md:mt-24">
        <p className="text-[11px] uppercase tracking-[0.3em] text-gold-deep">
          Bibliography
        </p>
        <h2 className="mt-3 text-3xl md:text-4xl">
          Works by <em className="text-burgundy">{name}</em>
        </h2>

        {booksLoading && (
          <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-[2/3] animate-pulse bg-gold/20" />
            ))}
          </div>
        )}

        {booksError && (
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

        {!booksLoading && !booksError && books.length === 0 && (
          <p className="mt-10 text-muted">No books found for this author.</p>
        )}

        {!booksLoading && !booksError && books.length > 0 && (
          <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
            {books.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        )}
      </section>

      {bio && (
        <p className="mt-16 text-xs text-muted">
          Biography and portrait: Wikipedia, under its open licenses.
        </p>
      )}
    </div>
  );
}