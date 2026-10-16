import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Icon } from "@iconify/react";
import JournalBookCard from "../../components/JournalBookCard/JournalBookCard";
import JournalCard from "../../components/JournalCard/JournalCard";
import {
  getArticleDate,
  getArticleReadingMinutes,
  journalArticles,
} from "../../data/journalArticles";
import { featuredBooksById } from "../../data/featuredBooks";
import usePageTitle from "../../hooks/usePageTitle";

const BOOKMARK_KEY = "plume:journal-bookmarks";

function readBookmarks() {
  try {
    const value = JSON.parse(localStorage.getItem(BOOKMARK_KEY));
    return Array.isArray(value)
      ? [...new Set(value.filter((id) => typeof id === "string"))]
      : [];
  } catch {
    return [];
  }
}

function saveBookmarks(bookmarks) {
  try {
    localStorage.setItem(BOOKMARK_KEY, JSON.stringify(bookmarks));
    return true;
  } catch {
    return false;
  }
}

function copyWithFallback(url) {
  if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(url);

  const input = document.createElement("textarea");
  input.value = url;
  input.setAttribute("readonly", "");
  input.style.position = "fixed";
  input.style.opacity = "0";
  document.body.append(input);
  input.select();
  const copied = document.execCommand("copy");
  input.remove();
  if (!copied) throw new Error("Copy was not available");
  return Promise.resolve();
}

export default function Article() {
  const { id } = useParams();
  const article = journalArticles.find((item) => item.id === id);
  const articleRef = useRef(null);
  const [bookmarks, setBookmarks] = useState(readBookmarks);
  const [progress, setProgress] = useState(0);
  const [feedback, setFeedback] = useState("");
  usePageTitle(article?.title || "Journal article");

  const related = useMemo(() => {
    if (!article) return [];
    const tags = new Set(article.tags);
    return journalArticles
      .filter((candidate) => candidate.id !== article.id)
      .map((candidate) => ({
        article: candidate,
        score:
          candidate.tags.filter((tag) => tags.has(tag)).length * 2 +
          candidate.bookIds.filter((bookId) => article.bookIds.includes(bookId)).length,
      }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score || b.article.publishedAt.localeCompare(a.article.publishedAt))
      .slice(0, 3)
      .map((item) => item.article);
  }, [article]);

  useEffect(() => {
    if (!article) return undefined;
    let frame = 0;
    const updateProgress = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const scrollableHeight =
          document.documentElement.scrollHeight - window.innerHeight;
        const next =
          scrollableHeight <= 0
            ? 100
            : Math.min(100, Math.max(0, Math.round((window.scrollY / scrollableHeight) * 100)));
        setProgress(next);
      });
    };

    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);
    updateProgress();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
    };
  }, [article]);

  if (!article) {
    return (
      <section className="mx-auto max-w-3xl px-6 py-20 text-center">
        <p className="text-[11px] uppercase tracking-[0.3em] text-gold-deep">Le Journal</p>
        <h1 className="mt-3 font-serif text-4xl">This story is not here</h1>
        <p className="mt-4 text-muted">The link may have changed. Browse the Journal to find another article.</p>
        <Link
          to="/journal"
          className="mt-8 inline-flex items-center gap-2 bg-burgundy px-7 py-3.5 text-xs uppercase tracking-[0.2em] text-cream transition hover:bg-burgundy/90"
        >
          Back to Le Journal
          <Icon icon="lucide:arrow-right" className="h-4 w-4" />
        </Link>
      </section>
    );
  }

  const saved = bookmarks.includes(article.id);
  const books = article.bookIds
    .map((bookId) => featuredBooksById.get(bookId)?.catalogBook)
    .filter(Boolean);
  const showContents = article.longForm && article.sections.length >= 3;

  const toggleBookmark = () => {
    const next = saved
      ? bookmarks.filter((bookmark) => bookmark !== article.id)
      : [...bookmarks, article.id];
    setBookmarks(next);
    setFeedback(
      saveBookmarks(next)
        ? saved
          ? "Article removed from your bookmarks."
          : "Article saved to your bookmarks."
        : "Your browser could not save this bookmark.",
    );
  };

  const shareArticle = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: article.title, text: article.subtitle, url });
        setFeedback("Article shared.");
        return;
      } catch (error) {
        if (error.name === "AbortError") return;
      }
    }

    try {
      await copyWithFallback(url);
      setFeedback("Article link copied.");
    } catch {
      setFeedback("Could not copy the article link.");
    }
  };

  return (
    <>
      <div
        role="progressbar"
        aria-label="Reading progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
        className="fixed inset-x-0 top-0 z-[60] h-1 bg-gold/20"
      >
        <div
          className="h-full bg-burgundy transition-[width] duration-150 motion-reduce:transition-none"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mx-auto max-w-6xl px-6 py-10 md:py-16">
        <Link
          to="/journal"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted transition hover:text-burgundy focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-burgundy"
        >
          <Icon icon="lucide:arrow-left" className="h-4 w-4" />
          Back to Le Journal
        </Link>

        <article ref={articleRef} className="mt-8">
          <header className="mx-auto max-w-4xl text-center">
            <p className="text-[11px] uppercase tracking-[0.3em] text-gold-deep">
              {article.category}
            </p>
            <h1 className="mt-4 font-serif text-4xl leading-tight md:text-6xl">
              {article.title}
            </h1>
            <p className="mx-auto mt-5 max-w-2xl font-serif text-lg italic leading-relaxed text-muted md:text-xl">
              {article.subtitle}
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-ink/70">
              <span>{article.author}</span>
              <span aria-hidden="true">·</span>
              <time dateTime={article.publishedAt}>{getArticleDate(article)}</time>
              <span aria-hidden="true">·</span>
              <span>{getArticleReadingMinutes(article)} min read</span>
            </div>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={toggleBookmark}
                aria-pressed={saved}
                className="inline-flex min-h-11 items-center gap-2 border border-line px-5 py-3 text-xs uppercase tracking-[0.15em] transition hover:border-burgundy hover:text-burgundy focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-burgundy"
              >
                <Icon icon={saved ? "lucide:bookmark-check" : "lucide:bookmark"} className="h-4 w-4" />
                {saved ? "Bookmarked" : "Bookmark"}
              </button>
              <button
                type="button"
                onClick={shareArticle}
                className="inline-flex min-h-11 items-center gap-2 bg-burgundy px-5 py-3 text-xs uppercase tracking-[0.15em] text-cream transition hover:bg-burgundy/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-burgundy"
              >
                <Icon icon="lucide:share-2" className="h-4 w-4" />
                Share article
              </button>
            </div>
            <p role="status" aria-live="polite" className="mt-3 min-h-5 text-xs text-muted">
              {feedback}
            </p>
          </header>

          <figure className="mx-auto mt-8 max-w-5xl overflow-hidden border border-line bg-secondary">
            <img
              src={article.cover}
              alt={`Illustration for ${article.title}`}
              className="max-h-[36rem] w-full object-cover"
            />
          </figure>

          <div className="mx-auto mt-12 grid max-w-5xl gap-10 lg:grid-cols-[minmax(0,1fr)_240px] lg:gap-14">
            <div className="min-w-0">
              {showContents && (
                <nav
                  aria-labelledby="contents-heading"
                  className="mb-10 border border-line bg-white/50 p-6 lg:hidden"
                >
                  <h2 id="contents-heading" className="font-serif text-xl text-burgundy">
                    In this story
                  </h2>
                  <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-muted">
                    {article.sections.map((section) => (
                      <li key={section.id}>
                        <a className="underline decoration-gold underline-offset-4 hover:text-burgundy" href={`#${section.id}`}>
                          {section.title}
                        </a>
                      </li>
                    ))}
                  </ol>
                </nav>
              )}

              <div className="space-y-10">
                {article.sections.map((section) => (
                  <section key={section.id} id={section.id} className="scroll-mt-28">
                    <h2 className="font-serif text-2xl leading-tight text-burgundy md:text-3xl">
                      {section.title}
                    </h2>
                    <div className="mt-4 space-y-5 text-base leading-8 text-ink/80 md:text-lg md:leading-9">
                      {section.paragraphs.map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            </div>

            {showContents && (
              <nav
                aria-labelledby="contents-sidebar-heading"
                className="hidden h-fit border border-line bg-white/50 p-6 lg:sticky lg:top-28 lg:block"
              >
                <h2 id="contents-sidebar-heading" className="font-serif text-xl text-burgundy">
                  In this story
                </h2>
                <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm leading-relaxed text-muted">
                  {article.sections.map((section) => (
                    <li key={section.id}>
                      <a className="underline decoration-gold underline-offset-4 hover:text-burgundy" href={`#${section.id}`}>
                        {section.title}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            )}
          </div>
        </article>

        {books.length > 0 && (
          <section aria-labelledby="mentioned-books-heading" className="mt-16 border-t border-line pt-12 md:mt-24">
            <p className="text-[11px] uppercase tracking-[0.3em] text-gold-deep">From our catalog</p>
            <h2 id="mentioned-books-heading" className="mt-3 font-serif text-3xl md:text-4xl">
              Books <em className="text-burgundy">mentioned</em>
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
              Explore the editions in the PLUME catalog. Prices are clearly marked as demonstrations where they are not verified retail prices.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-5">
              {books.map((book) => (
                <JournalBookCard key={book.id} book={book} />
              ))}
            </div>
          </section>
        )}

        {related.length > 0 && (
          <section aria-labelledby="related-articles-heading" className="mt-16 border-t border-line pt-12 md:mt-24">
            <p className="text-[11px] uppercase tracking-[0.3em] text-gold-deep">Continue reading</p>
            <h2 id="related-articles-heading" className="mt-3 font-serif text-3xl md:text-4xl">
              More from <em className="text-burgundy">Le Journal</em>
            </h2>
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {related.map((item) => (
                <JournalCard key={item.id} article={item} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
