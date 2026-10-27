import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { Icon } from "@iconify/react";
import BookCard from "../../components/BookCard/BookCard";
import useBook from "../../hooks/useBook";
import { authorQuery, searchBooks } from "../../api/books";
import { useShop } from "../../context/useShop";
import { formatPrice, toItem } from "../../context/shopUtils";
import BookCover from "../../components/BookCover/BookCover";
import BookJournal from "../../components/BookJournal/BookJournal";
import { journalArticles } from "../../data/journalArticles";
import usePageTitle from "../../hooks/usePageTitle";
import { getWikipediaBookInfo } from "../../api/wikipediaBooks";

function cleanDescription(text) {
  if (!text) return "";
  return text
    .split(/\r?\n-{5,}/)[0]
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\[\d+\]/g, "$1")
    .replace(/<[^>]+>/g, "")
    .trim();
}

function relatedOptions(book) {
  const info = book?.volumeInfo;
  if (!info) return null;
  const author = info.authors?.[0];
  if (author) {
    return { q: authorQuery(author), limit: 10 };
  }
  const subject = info.categories?.[0];
  if (subject) return { category: subject, limit: 10 };
  return null;
}

export default function BookDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { book: loadedBook, loading, error, retry } = useBook(id);
  const {
    addToCart,
    removeFromCart,
    setQty,
    toggleWishlist,
    inWishlist,
    cartQty,
  } = useShop();
  const [rel, setRel] = useState({ id: "", list: [] });
  const [wikiRes, setWikiRes] = useState({ id: "", data: null });
  const [actionMessage, setActionMessage] = useState("");
  const routeBook =
    location.state?.book?.id === id ? location.state.book : null;
  const sourceBook = loadedBook || routeBook;

  useEffect(() => {
    const info = sourceBook?.volumeInfo || {};
    if (!sourceBook || (info.description && info.imageLinks?.thumbnail)) {
      return undefined;
    }
    const controller = new AbortController();

    getWikipediaBookInfo(info.title, info.authors?.[0], controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setWikiRes({ id, data });
      })
      .catch((requestError) => {
        if (requestError.name !== "AbortError") {
          console.warn(
            `Unable to load Wikipedia details for ${info.title}:`,
            requestError,
          );
        }
      });

    return () => controller.abort();
  }, [id, sourceBook]);

  const wikiInfo = wikiRes.id === id ? wikiRes.data : null;
  const displayBook =
    sourceBook && wikiInfo
      ? {
          ...sourceBook,
          volumeInfo: {
            ...sourceBook.volumeInfo,
            description: sourceBook.volumeInfo.description || wikiInfo.extract,
            imageLinks: sourceBook.volumeInfo.imageLinks || {
              thumbnail: wikiInfo.thumbnail?.source,
            },
          },
        }
      : sourceBook;
  usePageTitle(displayBook?.volumeInfo?.title || "Book details");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    const options = relatedOptions(sourceBook);
    if (!options) return;
    const ctrl = new AbortController();

    searchBooks(options, ctrl.signal)
      .then((list) => {
        if (ctrl.signal.aborted) return;
        setRel({
          id: sourceBook.id,
          list: list.filter((b) => b.id !== sourceBook.id).slice(0, 4),
        });
      })
      .catch((e) => {
        if (e.name !== "AbortError") setRel({ id: sourceBook.id, list: [] });
      });

    return () => ctrl.abort();
  }, [sourceBook]);

  const goBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/discover");
  };

  const backButton = (
    <button
      type="button"
      onClick={goBack}
      className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted transition hover:text-burgundy"
    >
      <Icon icon="lucide:arrow-left" className="h-4 w-4" />
      Back
    </button>
  );

  if (loading) {
    return (
      <section className="mx-auto max-w-6xl px-6 py-12 md:py-20">
        {backButton}
        <div className="mt-10 grid gap-10 md:grid-cols-[300px_1fr] md:gap-14">
          <div className="aspect-[2/3] animate-pulse bg-gold/20" />
          <div className="space-y-4">
            <div className="h-4 w-24 animate-pulse bg-gold/20" />
            <div className="h-12 w-3/4 animate-pulse bg-gold/20" />
            <div className="h-4 w-1/3 animate-pulse bg-gold/20" />
            <div className="h-32 w-full animate-pulse bg-gold/20" />
          </div>
        </div>
      </section>
    );
  }

  if (error || !sourceBook) {
    return (
      <section className="mx-auto max-w-3xl px-6 py-20 text-center">
        <p className="text-[11px] uppercase tracking-[0.3em] text-gold-deep">
          Something went wrong
        </p>
        <h1 className="mt-3 text-4xl">We couldn’t load this book</h1>
        <p className="mt-4 text-muted">
          The link may be wrong, or the connection failed.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={retry}
            className="border border-line px-7 py-3.5 text-xs uppercase tracking-[0.2em] transition hover:border-burgundy hover:text-burgundy"
          >
            Try again
          </button>
          <Link
            to="/discover"
            className="bg-burgundy px-7 py-3.5 text-xs uppercase tracking-[0.2em] text-cream transition hover:bg-burgundy/90"
          >
            Discover books
          </Link>
        </div>
      </section>
    );
  }

  const book = displayBook;
  const info = book.volumeInfo || {};
  const cover = info.imageLinks?.thumbnail;
  const authors = info.authors || [];
  const paragraphs = cleanDescription(info.description)
    .split(/\n{2,}/)
    .filter(Boolean);
  const { price } = toItem(book);
  const liked = inWishlist(book.id);
  const qty = cartQty(book.id);
  const canRelate = Boolean(relatedOptions(book));
  const relatedLoading = canRelate && rel.id !== book.id;
  const journalLinks = journalArticles.filter((article) =>
    article.bookIds.includes(book.id),
  );

  const details = [
    { label: "Publisher in this edition", value: info.publisher },
    {
      label: info.publicationFromEdition
        ? "Edition published"
        : "First publication",
      value: info.publishedDate,
    },
    { label: "Pages in this edition", value: info.pageCount },
  ].filter((d) => d.value);
  const preferredCategories = [
    "Fiction",
    "Romance",
    "Fantasy",
    "Mystery",
    "Science",
    "History",
    "Philosophy",
    "Business",
    "Technology",
    "Historical",
  ];
  const categoryParts = (Array.isArray(info.categories) ? info.categories : [])
    .flatMap((category) =>
      typeof category === "string"
        ? category.split(",").map((part) => part.trim())
        : [],
    )
    .filter(
      (category) => category && category.length <= 30 && !/[()]/.test(category),
    );
  const uniqueCategories = [...new Set(categoryParts)];
  const categories = uniqueCategories
    .sort((a, b) => {
      const aIndex = preferredCategories.indexOf(a);
      const bIndex = preferredCategories.indexOf(b);
      return (
        (aIndex === -1 ? Infinity : aIndex) -
        (bIndex === -1 ? Infinity : bIndex)
      );
    })
    .slice(0, 3);

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 md:py-20">
      {backButton}

      <section className="mt-10 grid gap-10 md:grid-cols-[300px_1fr] md:gap-14">
        <div>
          <BookCover
            src={cover}
            alt={`Cover of ${info.title}`}
            title={info.title}
            className="mx-auto w-full max-w-[300px] border border-gold/40 shadow-lg"
          />
        </div>

        <div>
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Link
                  key={category}
                  to={`/discover?category=${encodeURIComponent(category)}`}
                  className="border border-line px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-gold-deep transition hover:border-burgundy hover:text-burgundy"
                >
                  {category}
                </Link>
              ))}
            </div>
          )}

          <h1 className="mt-4 text-4xl leading-tight md:text-5xl">
            {info.title}
          </h1>
          {info.subtitle && (
            <p className="mt-2 font-serif text-lg italic text-muted">
              {info.subtitle}
            </p>
          )}

          <p className="mt-4 text-ink/80">
            {authors.length === 0 ? (
              "Unknown author"
            ) : (
              <>
                by{" "}
                {authors.map((name, i) => (
                  <span key={name}>
                    {i > 0 && ", "}
                    <Link
                      to={`/author/${encodeURIComponent(name)}`}
                      className="text-burgundy underline decoration-gold underline-offset-4 hover:decoration-burgundy"
                    >
                      {name}
                    </Link>
                  </span>
                ))}
              </>
            )}
          </p>

          <p className="mt-6 font-['Inter',sans-serif] text-3xl font-light tracking-tight text-burgundy">
            {formatPrice(price)}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            {qty > 0 ? (
              <div className="flex h-[50px] min-w-[200px] items-center justify-between border border-burgundy text-burgundy">
                <button
                  type="button"
                  onClick={() => {
                    if (qty <= 1) {
                      removeFromCart(book.id);
                      setActionMessage(`${info.title} removed from your bag.`);
                    } else {
                      setQty(book.id, qty - 1);
                    }
                  }}
                  aria-label={
                    qty <= 1 ? "Remove from bag" : "Decrease quantity"
                  }
                  className="flex h-full w-12 items-center justify-center transition hover:bg-burgundy/5"
                >
                  <Icon
                    icon={qty <= 1 ? "lucide:trash-2" : "lucide:minus"}
                    className="h-4 w-4"
                  />
                </button>
                <span className="font-['Inter',sans-serif] text-xs uppercase tracking-[0.15em]">
                  {qty} in bag
                </span>
                <button
                  type="button"
                  onClick={() => setQty(book.id, qty + 1)}
                  disabled={qty >= 99}
                  aria-label="Increase quantity"
                  className="flex h-full w-12 items-center justify-center transition hover:bg-burgundy/5 disabled:opacity-40"
                >
                  <Icon icon="lucide:plus" className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  if (addToCart(book)) setActionMessage("Added to bag");
                }}
                className="flex items-center justify-center gap-2 bg-burgundy px-7 py-3.5 text-xs uppercase tracking-[0.2em] text-cream transition hover:bg-burgundy/90"
              >
                <Icon icon="lucide:shopping-bag" className="h-4 w-4" />
                Add to bag
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                toggleWishlist(book);
                setActionMessage(
                  liked
                    ? `${info.title} removed from your wishlist.`
                    : `${info.title} saved to your wishlist.`,
                );
              }}
              aria-pressed={liked}
              className="flex items-center justify-center gap-2 border border-line px-7 py-3.5 text-xs uppercase tracking-[0.2em] transition hover:border-burgundy hover:text-burgundy"
            >
              <Icon
                icon="lucide:heart"
                className={`h-4 w-4 ${liked ? "fill-burgundy text-burgundy" : ""}`}
              />
              {liked ? "In wishlist" : "Add to wishlist"}
            </button>
          </div>
          <p
            role="status"
            aria-live="polite"
            className="mt-3 min-h-5 text-sm text-muted"
          >
            {actionMessage}
          </p>

          {paragraphs.length > 0 ? (
            <div className="mt-10 max-w-2xl space-y-4 leading-relaxed text-muted">
              {paragraphs.map((p, i) => (
                <p key={i} className="whitespace-pre-line">
                  {p}
                </p>
              ))}
            </div>
          ) : (
            <p className="mt-10 text-muted">
              No description is available for this book.
            </p>
          )}

          {details.length > 0 && (
            <>
              <dl className="mt-10 grid max-w-2xl grid-cols-2 border-l border-t border-line sm:grid-cols-3">
                {details.map((d) => (
                  <div
                    key={d.label}
                    className="border-b border-r border-line p-4"
                  >
                    <dt className="text-[10px] uppercase tracking-[0.2em] text-gold-deep">
                      {d.label}
                    </dt>
                    <dd className="mt-1 break-words font-['Inter',sans-serif] text-sm font-light text-ink">
                      {d.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </>
          )}
        </div>
      </section>

      <BookJournal articles={journalLinks} />

      {canRelate && (
        <section className="mt-16 border-t border-line pt-12 md:mt-24">
          <p className="text-[11px] uppercase tracking-[0.3em] text-gold-deep">
            Keep reading
          </p>
          <h2 className="mt-3 text-3xl md:text-4xl">
            More to <em className="text-burgundy">discover</em>
          </h2>

          {relatedLoading ? (
            <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-[2/3] animate-pulse bg-gold/20"
                />
              ))}
            </div>
          ) : rel.list.length === 0 ? (
            <p className="mt-10 text-muted">No related books found.</p>
          ) : (
            <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
              {rel.list.map((b) => (
                <BookCard key={b.id} book={b} />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
