import { useState } from "react";
import { Link } from "react-router-dom";
import { Icon } from "@iconify/react";
import { formatPrice } from "../../context/shopUtils";
import { useShop } from "../../context/useShop";
import BookCover from "../../components/BookCover/BookCover";
import usePageTitle from "../../hooks/usePageTitle";

export default function Cart() {
  const { cart, cartCount, cartTotal, setQty, removeFromCart, clearCart } =
    useShop();
  const [message, setMessage] = useState("");
  const [confirmClear, setConfirmClear] = useState(false);
  usePageTitle("Your bag");

  return (
    <section className="mx-auto max-w-6xl px-6 py-12 md:py-20">
      <p className="text-[11px] uppercase tracking-[0.3em] text-gold-deep">
        Your selection
      </p>
      <h1 className="mt-3 text-4xl md:text-5xl">
        Your <em className="text-burgundy">bag</em>
      </h1>
      <p role="status" aria-live="polite" className="mt-3 min-h-5 text-sm text-muted">
        {message}
      </p>

      {cart.length === 0 ? (
        <div className="mt-12 border border-line bg-white/50 px-6 py-16 text-center">
          <Icon
            icon="lucide:shopping-bag"
            className="mx-auto h-8 w-8 text-gold-deep"
          />
          <h2 className="mt-4 text-2xl">Your bag is empty</h2>
          <p className="mt-2 text-muted">
            Add a book and it will wait for you here.
          </p>
          <Link
            to="/discover"
            className="mt-8 inline-block bg-burgundy px-7 py-3.5 text-xs uppercase tracking-[0.2em] text-cream transition hover:bg-burgundy/90"
          >
            Discover books
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_340px]">
          <ul className="divide-y divide-line border-y border-line">
            {cart.map((i) => (
              <li key={i.id} className="flex gap-4 py-6">
                <Link
                  to={`/books/${i.id}`}
                  className="block h-28 w-[74px] shrink-0 overflow-hidden border border-gold/40 bg-white/50"
                >
                  <BookCover
                    src={i.cover}
                    alt={`Cover of ${i.title}`}
                    title={i.title}
                    className="h-full w-full object-cover"
                  />
                </Link>

                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="line-clamp-2 font-serif text-lg text-burgundy">
                        <Link to={`/books/${i.id}`} className="hover:underline">
                          {i.title}
                        </Link>
                      </h2>
                      <p className="text-sm text-ink/70">
                        {i.authors.length === 0
                          ? "Unknown author"
                          : i.authors.join(", ")}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        removeFromCart(i.id);
                        setMessage(`${i.title} removed from your bag.`);
                      }}
                      aria-label={`Remove ${i.title}`}
                      className="shrink-0 text-muted transition hover:text-burgundy"
                    >
                      <Icon icon="lucide:trash-2" className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-auto flex items-center justify-between pt-4">
                    <div className="flex items-center border border-line">
                      <button
                        type="button"
                        onClick={() => setQty(i.id, i.qty - 1)}
                        disabled={i.qty <= 1}
                        aria-label="Decrease quantity"
                        className="flex h-9 w-9 items-center justify-center transition hover:text-burgundy disabled:opacity-40"
                      >
                        <Icon icon="lucide:minus" className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-9 text-center font-['Inter',sans-serif] text-sm">
                        {i.qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQty(i.id, i.qty + 1)}
                        disabled={i.qty >= 99}
                        aria-label="Increase quantity"
                        className="flex h-9 w-9 items-center justify-center transition hover:text-burgundy disabled:opacity-40"
                      >
                        <Icon icon="lucide:plus" className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <p className="font-['Inter',sans-serif] text-lg font-light text-burgundy">
                      {formatPrice(i.price * i.qty)}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <aside className="h-fit border border-line bg-white/50 p-6">
            <h2 className="text-2xl">Order summary</h2>

            <dl className="mt-6 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">Items</dt>
                <dd className="font-['Inter',sans-serif]">{cartCount}</dd>
              </div>
              <div className="flex justify-between border-t border-line pt-3">
                <dt>Subtotal</dt>
                <dd className="font-['Inter',sans-serif] text-lg font-light text-burgundy">
                  {formatPrice(cartTotal)}
                </dd>
              </div>
            </dl>

            <p className="mt-4 text-xs leading-relaxed text-muted">
              Shipping and taxes are not calculated.
            </p>

            <Link
              to="/payment"
              className="mt-6 block w-full bg-burgundy py-3.5 text-center text-xs uppercase tracking-[0.2em] text-cream transition hover:bg-burgundy/90"
            >
              Checkout
            </Link>

            <Link
              to="/discover"
              className="mt-4 block w-full border border-line py-3.5 text-center text-xs uppercase tracking-[0.2em] transition hover:border-burgundy hover:text-burgundy"
            >
              Continue shopping
            </Link>

            <button
              type="button"
              onClick={() => setConfirmClear(true)}
              className="mt-8 flex w-full cursor-pointer items-center justify-center gap-2 border border-burgundy/40 px-4 py-3 text-xs uppercase tracking-[0.2em] text-burgundy transition hover:bg-burgundy/5"
            >
              <Icon icon="lucide:trash-2" className="h-4 w-4" />
              Clear bag
            </button>
          </aside>
        </div>
      )}

      {confirmClear && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4">
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="clear-bag-title"
            className="w-full max-w-sm border border-line bg-cream p-6 shadow-xl"
            onKeyDown={(event) => {
              if (event.key === "Escape") setConfirmClear(false);
            }}
          >
            <h2 id="clear-bag-title" className="font-serif text-xl">
              Remove all items from your bag?
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
                onClick={() => {
                  clearCart();
                  setMessage("Your bag has been cleared.");
                  setConfirmClear(false);
                }}
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
