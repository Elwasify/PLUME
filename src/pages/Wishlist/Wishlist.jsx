import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Icon } from "@iconify/react";
import { formatPrice } from "../../context/shopUtils";
import { useShop } from "../../context/useShop";
import BookCover from "../../components/BookCover/BookCover";
import usePageTitle from "../../hooks/usePageTitle";

export default function Wishlist() {
  const {
    wishlist,
    toggleWishlist,
    clearWishlist,
    moveToCart,
    cartQty,
    inWishlist,
  } = useShop();
  const [message, setMessage] = useState("");
  const [removedBook, setRemovedBook] = useState(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const timeoutRef = useRef(null);
  usePageTitle("Wishlist");

  useEffect(
    () => () => {
      window.clearTimeout(timeoutRef.current);
    },
    [],
  );

  const removeFromWishlist = (book) => {
    toggleWishlist(book);
    setRemovedBook(book);
    setMessage(`${book.title} removed from your wishlist.`);
    window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => {
      setMessage("");
      setRemovedBook(null);
    }, 4000);
  };

  const undoRemove = () => {
    if (removedBook && !inWishlist(removedBook.id)) {
      toggleWishlist(removedBook);
    }
    window.clearTimeout(timeoutRef.current);
    setMessage("");
    setRemovedBook(null);
  };

  const moveBookToBag = (book) => {
    window.clearTimeout(timeoutRef.current);
    setRemovedBook(null);
    moveToCart(book);
    setMessage(`${book.title} moved to your bag.`);
  };

  const confirmClearAll = () => {
    window.clearTimeout(timeoutRef.current);
    setRemovedBook(null);
    clearWishlist();
    setMessage("Your wishlist has been cleared.");
    setConfirmClear(false);
  };

  return (
    <section className="mx-auto max-w-6xl px-6 py-12 md:py-20">
      <p className="text-[11px] uppercase tracking-[0.3em] text-gold-deep">
        Saved for later
      </p>
      <h1 className="mt-3 text-4xl md:text-5xl">
        Your <em className="text-burgundy">wishlist</em>
      </h1>
      <p
        role="status"
        aria-live="polite"
        className="mt-3 min-h-5 text-sm text-muted"
      >
        {message}
        {removedBook && (
          <>
            {" "}
            <button
              type="button"
              onClick={undoRemove}
              className="cursor-pointer text-burgundy underline underline-offset-2 hover:text-ink"
            >
              Undo
            </button>
          </>
        )}
      </p>

      {wishlist.length === 0 ? (
        <div className="mt-12 border border-line bg-white/50 px-6 py-16 text-center">
          <Icon
            icon="lucide:heart"
            className="mx-auto h-8 w-8 text-gold-deep"
          />
          <h2 className="mt-4 text-2xl">Start your reading list</h2>
          <p className="mt-2 text-muted">
            Tap the heart on any book to save it here.
          </p>
          <Link
            to="/discover"
            className="mt-8 inline-block bg-burgundy px-7 py-3.5 text-xs uppercase tracking-[0.2em] text-cream transition hover:bg-burgundy/90"
          >
            Discover books
          </Link>
        </div>
      ) : (
        <>
          <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
            {wishlist.map((b) => {
              const qty = cartQty(b.id);
              return (
                <article key={b.id} className="group flex h-full flex-col">
                  <div className="relative">
                    <Link
                      to={`/books/${b.id}`}
                      className="block aspect-[2/3] overflow-hidden border border-gold/40 bg-white/50"
                    >
                      <BookCover
                        src={b.cover}
                        alt={`Cover of ${b.title}`}
                        title={b.title}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                    </Link>
                    <button
                      type="button"
                      onClick={() => removeFromWishlist(b)}
                      aria-label={`Remove ${b.title} from wishlist`}
                      className="absolute right-2 top-2 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-burgundy/30 bg-cream text-burgundy shadow-sm transition hover:border-burgundy hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-burgundy"
                    >
                      <Icon icon="lucide:x" className="h-4 w-4" />
                    </button>
                  </div>

                  <h3 className="mt-3 line-clamp-2 h-14 font-serif text-lg leading-7 text-burgundy">
                    <Link to={`/books/${b.id}`} className="hover:underline">
                      {b.title}
                    </Link>
                  </h3>
                  <p className="mt-1 line-clamp-1 h-5 text-sm leading-5 text-ink/70">
                    {b.authors.length === 0
                      ? "Unknown author"
                      : b.authors.join(", ")}
                  </p>

                  <div className="mt-auto pt-3">
                    <p className="font-['Inter',sans-serif] text-sm font-light text-burgundy">
                      {formatPrice(b.price)}
                    </p>

                    <button
                      type="button"
                      onClick={() => moveBookToBag(b)}
                      className="mt-3 flex h-10 w-full items-center justify-center gap-2 border border-line text-[11px] uppercase tracking-[0.2em] transition hover:border-burgundy hover:text-burgundy"
                    >
                      <Icon
                        icon={qty > 0 ? "lucide:check" : "lucide:shopping-bag"}
                        className="h-3.5 w-3.5"
                      />
                      Move to bag
                    </button>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="mt-12 flex justify-center">
            <button
              type="button"
              onClick={() => setConfirmClear(true)}
              className="flex cursor-pointer items-center justify-center gap-2 border border-burgundy/40 px-6 py-3 text-xs uppercase tracking-[0.2em] text-burgundy transition hover:bg-burgundy/5"
            >
              <Icon icon="lucide:trash-2" className="h-4 w-4" />
              Clear wishlist
            </button>
          </div>
        </>
      )}

      {confirmClear && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4">
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="clear-wishlist-title"
            className="w-full max-w-sm border border-line bg-cream p-6 shadow-xl"
            onKeyDown={(event) => {
              if (event.key === "Escape") setConfirmClear(false);
            }}
          >
            <h2 id="clear-wishlist-title" className="font-serif text-xl">
              Remove all books from your wishlist?
            </h2>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                autoFocus
                onClick={() => setConfirmClear(false)}
                className="cursor-pointer border border-line px-4 py-2 text-xs uppercase tracking-[0.15em] transition hover:border-burgundy hover:text-burgundy"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmClearAll}
                className="cursor-pointer border border-burgundy/40 px-4 py-2 text-xs uppercase tracking-[0.15em] text-burgundy transition hover:bg-burgundy/5"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
