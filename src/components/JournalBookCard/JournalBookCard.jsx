import { useState } from "react";
import { Link } from "react-router-dom";
import { Icon } from "@iconify/react";
import BookCover from "../BookCover/BookCover";
import { useShop } from "../../context/useShop";
import { formatPrice, toItem } from "../../context/shopUtils";

export default function JournalBookCard({ book }) {
  const { addToCart, toggleWishlist, inWishlist, cartQty } = useShop();
  const [message, setMessage] = useState("");
  const liked = inWishlist(book.id);
  const quantity = cartQty(book.id);
  const { price, demo } = toItem(book);
  const title = book.volumeInfo.title;

  const addBook = () => {
    addToCart(book);
    setMessage(`${title} added to your cart.`);
  };

  const toggleSaved = () => {
    toggleWishlist(book);
    setMessage(
      liked ? `${title} removed from your wishlist.` : `${title} saved to your wishlist.`,
    );
  };

  return (
    <article className="flex h-full flex-col border border-line bg-white/50 p-4">
      <div className="relative">
        <Link
          to={`/books/${book.id}`}
          className="block aspect-[2/3] overflow-hidden border border-gold/40 bg-cream"
        >
          <BookCover
            src={book.volumeInfo.imageLinks?.thumbnail}
            alt={`Cover of ${title}`}
            title={title}
            author={book.volumeInfo.authors?.[0]}
            className="h-full w-full object-cover"
          />
        </Link>
        <button
          type="button"
          onClick={toggleSaved}
          aria-label={liked ? `Remove ${title} from wishlist` : `Save ${title} to wishlist`}
          aria-pressed={liked}
          className="absolute right-2 top-2 flex h-10 w-10 items-center justify-center rounded-full bg-cream/95 text-burgundy transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-burgundy"
        >
          <Icon
            icon="lucide:heart"
            className={`h-4 w-4 ${liked ? "fill-burgundy text-burgundy" : ""}`}
          />
        </button>
      </div>

      <h3 className="mt-4 line-clamp-2 min-h-14 font-serif text-lg leading-7 text-burgundy">
        <Link to={`/books/${book.id}`} className="hover:underline">
          {title}
        </Link>
      </h3>
      <p className="mt-1 min-h-5 text-sm text-ink/70">
        {book.volumeInfo.authors?.join(", ") || "Author information unavailable"}
      </p>

      <div className="mt-auto pt-3">
        <p className="font-['Inter',sans-serif] text-sm font-light text-burgundy">
          {formatPrice(price)}
          {demo && <span className="ml-1 text-[10px] text-muted">demo</span>}
        </p>
        <button
          type="button"
          onClick={addBook}
          className="mt-3 flex h-10 w-full items-center justify-center gap-2 border border-line text-[11px] uppercase tracking-[0.16em] transition hover:border-burgundy hover:text-burgundy focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-burgundy"
        >
          <Icon
            icon={quantity > 0 ? "lucide:check" : "lucide:shopping-bag"}
            className="h-3.5 w-3.5"
          />
          {quantity > 0 ? `In cart (${quantity})` : "Add to cart"}
        </button>
        <p role="status" aria-live="polite" className="mt-2 min-h-5 text-xs text-muted">
          {message}
        </p>
      </div>
    </article>
  );
}
