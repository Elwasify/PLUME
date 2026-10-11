import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Icon } from "@iconify/react";
import BookCard from "../../components/BookCard/BookCard";
import useBook from "../../hooks/useBook";
import { authorQuery, searchBooks } from "../../api/books";
import { useShop } from "../../context/useShop";
import { formatPrice, toItem } from "../../context/shopUtils";
import BookCover from "../../components/BookCover/BookCover";
import usePageTitle from "../../hooks/usePageTitle";

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
  const { book, loading, error, retry } = useBook(id);
  const { addToCart, toggleWishlist, inWishlist, cartQty } = useShop();
  const [rel, setRel] = useState({ id: "", list: [] });
  usePageTitle(book?.volumeInfo?.title || "Book details");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    const options = relatedOptions(book);
    if (!options) return;
    const ctrl = new AbortController();

    searchBooks(options, ctrl.signal)
      .then((list) => {
        if (ctrl.signal.aborted) return;
        setRel({
          id: book.id,
          list: list.filter((b) => b.id !== book.id).slice(0, 4),
        });
      })
      .catch((e) => {
        if (e.name !== "AbortError") setRel({ id: book.id, list: [] });
      });

    return () => ctrl.abort();
  }, [book]);

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

  if (error || !book) {
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

  const info = book.volumeInfo || {};
  const cover = info.imageLinks?.thumbnail;
  const authors = info.authors || [];
  const paragraphs = cleanDescription(info.description)
    .split(/\n{2,}/)
    .filter(Boolean);
  const { price, demo } = toItem(book);
  const liked = inWishlist(book.id);
  const qty = cartQty(book.id);
  const canRelate = Boolean(relatedOptions(book));
  const relatedLoading = canRelate && rel.id !== book.id;

  const details = [
    { label: "Publisher", value: info.publisher },
    { label: "Published", value: info.publishedDate },
    { label: "Pages", value: info.pageCount },
  ].filter((d) => d.value);

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
          {info.categories?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {info.categories.slice(0, 3).map((c) => (
                <Link
                  key={c}
                  to={`/discover?q=${encodeURIComponent(c)}`}
                  className="border border-line px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-gold-deep transition hover:border-burgundy hover:text-burgundy"
                >
                  {c}
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
            {demo && (
              <span className="ml-2 text-xs tracking-normal text-muted">
                demo price
              </span>
            )}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => addToCart(book)}
              className="flex items-center justify-center gap-2 bg-burgundy px-7 py-3.5 text-xs uppercase tracking-[0.2em] text-cream transition hover:bg-burgundy/90"
            >
              <Icon
                icon={qty > 0 ? "lucide:check" : "lucide:shopping-bag"}
                className="h-4 w-4"
              />
              {qty > 0 ? `In bag (${qty})` : "Add to bag"}
            </button>
            <button
              type="button"
              onClick={() => toggleWishlist(book)}
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
          )}
        </div>
      </section>

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
