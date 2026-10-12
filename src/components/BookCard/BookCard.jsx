import { Link } from "react-router-dom";
import { Icon } from "@iconify/react";
import { formatPrice, toItem } from "../../context/shopUtils";
import { useShop } from "../../context/useShop";
import BookCover from "../BookCover/BookCover";

export default function BookCard({ book }) {
  const { addToCart, toggleWishlist, inWishlist, cartQty } = useShop();
  const info = book.volumeInfo || {};
  const cover = info.imageLinks?.thumbnail?.replace("http://", "https://");
  const authors = info.authors || [];
  const rating = info.averageRating;
  const { price, demo } = toItem(book);
  const liked = inWishlist(book.id);
  const qty = cartQty(book.id);

  return (
    <article className="group flex h-full flex-col">
      <div className="relative">
        <Link
          to={`/books/${book.id}`}
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
          onClick={() => toggleWishlist(book)}
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
        <Link to={`/books/${book.id}`} className="hover:underline">
          {info.title}
        </Link>
      </h3>

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
                  {name}
                </Link>
              </span>
            ))}
      </p>

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
            {formatPrice(price)}
            {demo && <span className="ml-1 text-[10px] text-muted">demo</span>}
          </span>
        </div>

        <button
          type="button"
          onClick={() => addToCart(book)}
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
}