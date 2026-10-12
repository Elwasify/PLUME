import { Link } from "react-router-dom";
import { Icon } from "@iconify/react";
import { formatPrice } from "../../context/shopUtils";
import { useShop } from "../../context/useShop";
import BookCover from "../../components/BookCover/BookCover";
import usePageTitle from "../../hooks/usePageTitle";

export default function Wishlist() {
  const { wishlist, toggleWishlist, addToCart, cartQty } = useShop();
  usePageTitle("Wishlist");

  return (
    <section className="mx-auto max-w-6xl px-6 py-12 md:py-20">
      <p className="text-[11px] uppercase tracking-[0.3em] text-gold-deep">
        Saved for later
      </p>
      <h1 className="mt-3 text-4xl md:text-5xl">
        Your <em className="text-burgundy">wishlist</em>
      </h1>

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
                    onClick={() => toggleWishlist(b)}
                    aria-label="Remove from wishlist"
                    className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-cream/90 text-burgundy transition hover:bg-white"
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
                    {b.demo && (
                      <span className="ml-1 text-[10px] text-muted">demo</span>
                    )}
                  </p>

                  <button
                    type="button"
                    onClick={() => addToCart(b)}
                    className="mt-3 flex h-10 w-full items-center justify-center gap-2 border border-line text-[11px] uppercase tracking-[0.2em] transition hover:border-burgundy hover:text-burgundy"
                  >
                    <Icon
                      icon={qty > 0 ? "lucide:check" : "lucide:shopping-bag"}
                      className="h-3.5 w-3.5"
                    />
                    {qty > 0 ? `In bag (${qty})` : "Add to bag"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}