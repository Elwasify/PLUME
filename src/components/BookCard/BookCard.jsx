import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Icon } from "@iconify/react";
import { formatPrice, toItem } from "../../context/shopUtils";
import { useShop } from "../../context/useShop";
import BookCover from "../BookCover/BookCover";
import Highlight from "../Highlight/Highlight.jsx";
import { getWikipediaBookInfo } from "../../api/wikipediaBooks";

export default function BookCard({
  book,
  showDescription = false,
  hideAuthor = false,
  lazyDescription = false,
  terms = [],
}) {
  const {
    addToCart,
    removeFromCart,
    setQty,
    toggleWishlist,
    inWishlist,
    cartQty,
  } = useShop();
  const [feedback, setFeedback] = useState("");
  const [wikiInfo, setWikiInfo] = useState({ id: "", data: null });
  const [inView, setInView] = useState(false);
  const cardRef = useRef(null);
  const info = book.volumeInfo || {};
  const authors = info.authors || [];
  const author = authors[0];
  const wikipediaInfo = wikiInfo.id === book.id ? wikiInfo.data : null;
  const cover =
    info.imageLinks?.thumbnail?.replace("http://", "https://") ||
    wikipediaInfo?.thumbnail?.source;
  const description =
    info.description ||
    (wikipediaInfo?.extract && wikiInfo.id === book.id
      ? wikipediaInfo.extract
      : "");
  const showDescriptionNow = showDescription && (!lazyDescription || inView);
  const shortenedDescription =
    description.length > 160
      ? `${description.slice(0, 157).trimEnd()}…`
      : description;
  const displayBook = wikipediaInfo
    ? {
        ...book,
        volumeInfo: {
          ...info,
          description: info.description || wikipediaInfo.extract,
          imageLinks: info.imageLinks || {
            thumbnail: wikipediaInfo.thumbnail?.source,
          },
        },
      }
    : book;
  const rating = info.averageRating;
  const item = toItem(book);
  const price = item ? item.price : null;
  const liked = inWishlist(book.id);
  const qty = cartQty(book.id);
  const needsWikipedia =
    !(cover && (!showDescription || info.description)) &&
    wikiInfo.id !== book.id;

  useEffect(() => {
    if ((!needsWikipedia && !lazyDescription) || inView || !cardRef.current) {
      return undefined;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setInView(true);
      },
      { rootMargin: lazyDescription ? "0px" : "200px" },
    );
    observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, [inView, lazyDescription, needsWikipedia]);

  useEffect(() => {
    if (!needsWikipedia || !inView) return undefined;
    const controller = new AbortController();

    getWikipediaBookInfo(info.title, author, controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setWikiInfo({ id: book.id, data });
      })
      .catch((error) => {
        if (error.name !== "AbortError") {
          console.warn(
            `Unable to load Wikipedia details for ${info.title}:`,
            error,
          );
        }
      });

    return () => controller.abort();
  }, [author, book.id, inView, info.title, needsWikipedia]);

  return (
    <article ref={cardRef} className="group flex h-full flex-col">
      <div className="relative">
        <Link
          to={`/books/${book.id}`}
          state={{ book: displayBook }}
          className="block aspect-[2/3] overflow-hidden border border-gold/40 bg-white/50"
        >
          <BookCover
            src={cover}
            alt={`Cover of ${info.title}`}
            title={info.title}
            author={authors[0]}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        </Link>

        <button
          type="button"
          onClick={() => {
            toggleWishlist(book);
            setFeedback(
              liked
                ? `${info.title} removed from your wishlist.`
                : `${info.title} saved to your wishlist.`,
            );
          }}
          aria-label={liked ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={liked}
          className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-cream/90 text-burgundy transition hover:bg-white"
        >
          <Icon
            icon="lucide:heart"
            className={`h-4 w-4 ${liked ? "[&_path]:fill-burgundy" : ""}`}
          />
        </button>
      </div>

      <h3 className="mt-3 line-clamp-2 h-14 font-serif text-lg leading-7 text-burgundy">
        <Link
          to={`/books/${book.id}`}
          state={{ book: displayBook }}
          className="hover:underline"
        >
          <Highlight text={info.title || ""} terms={terms} />
        </Link>
      </h3>

      {!hideAuthor && (
        <p className="mt-1 line-clamp-1 h-5 text-sm leading-5 text-ink/70">
          {authors.length === 0
            ? "Unknown author"
            : authors.map((name, i) => (
                <span key={name}>
                  {i > 0 && ", "}
                  <Link
                    to={`/author/${encodeURIComponent(name)}`}
                    className="hover:text-burgundy hover:underline"
                  >
                    <Highlight text={name} terms={terms} />
                  </Link>
                </span>
              ))}
        </p>
      )}

      {showDescriptionNow && description && (
        <p className="mt-2 line-clamp-3 min-h-[3.75rem] text-xs leading-5 text-muted">
          {shortenedDescription}{" "}
          <Link to={`/books/${book.id}`} className="text-burgundy underline">
            Read more
          </Link>
        </p>
      )}

      <div className="mt-auto pt-3">
        <div className="flex h-5 items-center justify-between font-['Inter',sans-serif] text-sm font-light">
          {rating ? (
            <span className="flex items-center gap-1 text-ink">
              <Icon
                icon="lucide:star"
                className="h-3.5 w-3.5 text-gold [&_path]:fill-gold"
              />
              {rating}
            </span>
          ) : (
            <span />
          )}
          <span className="text-burgundy">
            {price === null ? "" : formatPrice(price)}
          </span>
        </div>

        {qty > 0 ? (
          <div className="mt-3 flex h-10 w-full items-center justify-between border border-burgundy text-burgundy">
            <button
              type="button"
              onClick={() => {
                if (qty <= 1) {
                  removeFromCart(book.id);
                  setFeedback(`${info.title} removed from your bag.`);
                } else {
                  setQty(book.id, qty - 1);
                }
              }}
              aria-label={qty <= 1 ? "Remove from bag" : "Decrease quantity"}
              className="flex h-full w-10 items-center justify-center transition hover:bg-burgundy/5"
            >
              <Icon
                icon={qty <= 1 ? "lucide:trash-2" : "lucide:minus"}
                className="h-4 w-4"
              />
            </button>
            <span className="font-['Inter',sans-serif] text-[11px] uppercase tracking-[0.15em]">
              {qty} in bag
            </span>
            <button
              type="button"
              onClick={() => setQty(book.id, qty + 1)}
              disabled={qty >= 99}
              aria-label="Increase quantity"
              className="flex h-full w-10 items-center justify-center transition hover:bg-burgundy/5 disabled:opacity-40"
            >
              <Icon icon="lucide:plus" className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => {
              if (addToCart(book)) setFeedback("Added to bag");
            }}
            className="mt-3 flex h-10 w-full items-center justify-center gap-2 border border-line text-[11px] uppercase tracking-[0.2em] transition hover:border-burgundy hover:text-burgundy"
          >
            <Icon icon="lucide:shopping-bag" className="h-3.5 w-3.5" />
            Add to bag
          </button>
        )}
        <p className="sr-only" role="status" aria-live="polite">
          {feedback}
        </p>
      </div>
    </article>
  );
}
