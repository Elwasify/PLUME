import { useState } from "react";
import { Link } from "react-router-dom";
import { Icon } from "@iconify/react";
import BookCover from "../../components/BookCover/BookCover";
import { useShop } from "../../context/useShop";
import { formatPrice } from "../../context/shopUtils";
import usePageTitle from "../../hooks/usePageTitle";

const fields = [
  { name: "firstName", label: "First name", autoComplete: "given-name" },
  { name: "lastName", label: "Last name", autoComplete: "family-name" },
  {
    name: "email",
    label: "Email address",
    type: "email",
    autoComplete: "email",
  },
  {
    name: "phone",
    label: "Phone number",
    type: "tel",
    autoComplete: "tel",
  },
  {
    name: "address",
    label: "Street address",
    autoComplete: "street-address",
    wide: true,
  },
  { name: "city", label: "City", autoComplete: "address-level2" },
  { name: "country", label: "Country", autoComplete: "country-name" },
];

const countries = [
  "Egypt",
  "Saudi Arabia",
  "United Arab Emirates",
  "Kuwait",
  "Qatar",
  "Jordan",
  "Lebanon",
  "Morocco",
  "United Kingdom",
  "United States",
  "France",
  "Germany",
  "Canada",
  "Other",
];

const phonePattern = /^[+\d][\d\s-]{6,18}$/;

const inputClass =
  "mt-2 w-full border border-line bg-cream px-3 py-3 text-sm outline-none transition placeholder:text-muted/70 focus:border-burgundy focus:ring-2 focus:ring-burgundy/15";

export default function Payment() {
  // If your clear function has a different name (e.g. emptyCart), change it here.
  const { cart, cartCount, cartTotal, clearCart } = useShop();
  const [method, setMethod] = useState("card");
  const [errors, setErrors] = useState({});
  const [order, setOrder] = useState(null);
  usePageTitle("Payment");

  const submitOrder = (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    const nextErrors = {};

    if (!data.firstName?.trim())
      nextErrors.firstName = "Please enter your first name.";
    if (!data.lastName?.trim())
      nextErrors.lastName = "Please enter your last name.";
    if (!/^\S+@\S+\.\S+$/.test(data.email || ""))
      nextErrors.email = "Please enter a valid email address.";
    if (!phonePattern.test((data.phone || "").trim()))
      nextErrors.phone = "Please enter a valid phone number.";
    if (!data.address?.trim())
      nextErrors.address = "Please enter your street address.";
    if (!data.city?.trim()) nextErrors.city = "Please enter your city.";
    if (!data.country) nextErrors.country = "Please choose a country.";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      const first = Object.keys(nextErrors)[0];
      document.getElementById(`payment-${first}`)?.focus();
      return;
    }

    setOrder({
      number: `PLM-${Math.floor(100000 + Math.random() * 900000)}`,
      firstName: data.firstName.trim(),
      email: data.email.trim(),
      items: cart.map((item) => ({ ...item })),
      count: cartCount,
      total: cartTotal,
    });
    clearCart();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (order) {
    return (
      <section className="mx-auto max-w-3xl px-6 py-12 md:py-20">
        <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.18em] text-muted">
          <span className="text-burgundy">01 Bag</span>
          <span aria-hidden="true" className="h-px w-8 bg-line" />
          <span className="text-burgundy">02 Details</span>
          <span aria-hidden="true" className="h-px w-8 bg-line" />
          <span className="text-burgundy">03 Confirmation</span>
        </div>

        <Icon
          icon="lucide:check-circle"
          className="mt-10 h-10 w-10 text-gold-deep"
        />
        <p className="mt-4 text-[11px] uppercase tracking-[0.3em] text-gold-deep">
          Order {order.number}
        </p>
        <h1 className="mt-3 font-serif text-4xl md:text-5xl">
          Thank you, <em className="text-burgundy">{order.firstName}</em>
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-muted">
          A confirmation would be sent to {order.email}. This is a demo order,
          so no payment was taken and no details were sent anywhere.
        </p>

        <ul className="mt-8 divide-y divide-line border-y border-line">
          {order.items.map((item) => (
            <li key={item.id} className="flex gap-3 py-4">
              <BookCover
                src={item.cover}
                alt={`Cover of ${item.title}`}
                title={item.title}
                className="h-16 w-11 shrink-0 border border-gold/40 object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 font-serif text-sm text-burgundy">
                  {item.title}
                </p>
                <p className="mt-1 text-xs text-muted">Qty {item.qty}</p>
              </div>
              <p className="shrink-0 text-sm font-light text-burgundy">
                {formatPrice(item.price * item.qty)}
              </p>
            </li>
          ))}
        </ul>

        <div className="mt-5 flex justify-between text-sm">
          <span>Total ({order.count} items)</span>
          <span className="font-['Inter',sans-serif] text-lg font-light text-burgundy">
            {formatPrice(order.total)}
          </span>
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            to="/discover"
            className="inline-flex bg-burgundy px-7 py-3.5 text-xs uppercase tracking-[0.2em] text-cream transition hover:bg-burgundy/90"
          >
            Continue shopping
          </Link>
          <Link
            to="/"
            className="inline-flex border border-line px-7 py-3.5 text-xs uppercase tracking-[0.2em] transition hover:border-burgundy hover:text-burgundy"
          >
            Back to home
          </Link>
        </div>
      </section>
    );
  }

  if (cart.length === 0) {
    return (
      <section className="mx-auto max-w-3xl px-6 py-12 text-center md:py-16">
        <Icon
          icon="lucide:shopping-bag"
          className="mx-auto h-8 w-8 text-gold-deep"
        />
        <h1 className="mt-5 font-serif text-4xl">Your bag is empty</h1>
        <p className="mt-3 text-muted">Add a book before continuing to payment.</p>
        <Link
          to="/discover"
          className="mt-8 inline-flex bg-burgundy px-7 py-3.5 text-xs uppercase tracking-[0.2em] text-cream transition hover:bg-burgundy/90"
        >
          Discover books
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-6 py-12 md:py-20">
      <Link
        to="/cart"
        className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted transition hover:text-burgundy"
      >
        <Icon icon="lucide:arrow-left" className="h-4 w-4" />
        Back to bag
      </Link>

      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-14">
        <div>
          <p className="text-[11px] uppercase tracking-[0.3em] text-gold-deep">
            Checkout
          </p>
          <h1 className="mt-3 font-serif text-4xl md:text-5xl">
            Payment <em className="text-burgundy">details</em>
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted">
            Choose a payment method and enter your contact details. This is a
            portfolio demo, so no real payment is processed.
          </p>
          <div className="mt-6 flex items-start gap-3 border border-gold/50 bg-secondary/40 p-4 text-sm leading-relaxed text-ink/80">
            <Icon
              icon="lucide:info"
              className="mt-0.5 h-4 w-4 shrink-0 text-gold-deep"
            />
            <p>
              Demo only. Nothing on this page is sent anywhere, and no payment
              is taken.
            </p>
          </div>

          <div className="mt-8 flex items-center gap-3 text-[10px] uppercase tracking-[0.18em] text-muted">
            <span className="text-burgundy">01 Bag</span>
            <span aria-hidden="true" className="h-px w-8 bg-line" />
            <span className="text-burgundy">02 Details</span>
            <span aria-hidden="true" className="h-px w-8 bg-line" />
            <span>03 Confirmation</span>
          </div>

          <form onSubmit={submitOrder} noValidate className="mt-10 space-y-10">
            <fieldset>
              <legend className="font-serif text-2xl">Contact and billing</legend>
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                {fields.map((field) => (
                  <label
                    key={field.name}
                    htmlFor={`payment-${field.name}`}
                    className={`block text-xs text-ink/80 ${field.wide ? "sm:col-span-2" : ""}`}
                  >
                    {field.label}
                    {field.name === "country" ? (
                      <select
                        id="payment-country"
                        name="country"
                        autoComplete={field.autoComplete}
                        defaultValue=""
                        aria-invalid={Boolean(errors.country)}
                        aria-describedby={
                          errors.country ? "payment-country-error" : undefined
                        }
                        className={inputClass}
                      >
                        <option value="" disabled>
                          Select a country
                        </option>
                        {countries.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        id={`payment-${field.name}`}
                        name={field.name}
                        type={field.type || "text"}
                        autoComplete={field.autoComplete}
                        aria-invalid={Boolean(errors[field.name])}
                        aria-describedby={
                          errors[field.name]
                            ? `payment-${field.name}-error`
                            : undefined
                        }
                        className={inputClass}
                      />
                    )}
                    {errors[field.name] && (
                      <span
                        id={`payment-${field.name}-error`}
                        role="alert"
                        className="mt-1 block text-xs text-burgundy"
                      >
                        {errors[field.name]}
                      </span>
                    )}
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="font-serif text-2xl">Payment method</legend>
              <p className="mt-2 text-sm text-muted">
                This is a demo, no card or wallet details are collected.
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <label
                  className={`flex cursor-pointer items-start gap-3 border p-4 transition ${
                    method === "card"
                      ? "border-burgundy bg-white/70"
                      : "border-line hover:border-burgundy/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={method === "card"}
                    onChange={() => setMethod("card")}
                    className="mt-1 accent-burgundy"
                  />
                  <span>
                    <span className="flex items-center gap-2 font-medium">
                      <Icon
                        icon="lucide:credit-card"
                        className="h-4 w-4 text-burgundy"
                      />
                      Bank card
                    </span>
                    <span className="mt-1 block text-xs text-muted">
                      Visa, Mastercard, and supported cards
                    </span>
                  </span>
                </label>
                <label
                  className={`flex cursor-pointer items-start gap-3 border p-4 transition ${
                    method === "wallet"
                      ? "border-burgundy bg-white/70"
                      : "border-line hover:border-burgundy/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="wallet"
                    checked={method === "wallet"}
                    onChange={() => setMethod("wallet")}
                    className="mt-1 accent-burgundy"
                  />
                  <span>
                    <span className="flex items-center gap-2 font-medium">
                      <Icon
                        icon="lucide:smartphone"
                        className="h-4 w-4 text-burgundy"
                      />
                      Mobile wallet
                    </span>
                    <span className="mt-1 block text-xs text-muted">
                      Pay with a supported wallet
                    </span>
                  </span>
                </label>
              </div>
            </fieldset>

            <div>
              <button
                type="submit"
                className="flex min-h-12 w-full items-center justify-center gap-2 bg-burgundy px-6 py-3.5 text-xs uppercase tracking-[0.2em] text-cream transition hover:bg-burgundy/90 sm:w-auto"
              >
                Place demo order
                <Icon icon="lucide:arrow-right" className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>

        <aside className="h-fit border border-line bg-white/50 p-6 lg:sticky lg:top-28">
          <h2 className="font-serif text-2xl">Order summary</h2>
          <ul className="mt-5 divide-y divide-line border-y border-line">
            {cart.map((item) => (
              <li key={item.id} className="flex gap-3 py-4">
                <BookCover
                  src={item.cover}
                  alt={`Cover of ${item.title}`}
                  title={item.title}
                  className="h-16 w-11 shrink-0 border border-gold/40 object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 font-serif text-sm text-burgundy">
                    {item.title}
                  </p>
                  <p className="mt-1 text-xs text-muted">Qty {item.qty}</p>
                </div>
                <p className="shrink-0 text-sm font-light text-burgundy">
                  {formatPrice(item.price * item.qty)}
                </p>
              </li>
            ))}
          </ul>

          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between text-muted">
              <dt>Items</dt>
              <dd>{cartCount}</dd>
            </div>
            <div className="flex justify-between border-t border-line pt-3">
              <dt>Subtotal</dt>
              <dd className="font-['Inter',sans-serif] text-lg font-light text-burgundy">
                {formatPrice(cartTotal)}
              </dd>
            </div>
            <div className="flex justify-between text-xs text-muted">
              <dt>Shipping and taxes</dt>
              <dd>Not calculated</dd>
            </div>
          </dl>

          <p className="mt-5 flex items-center gap-2 border-t border-line pt-4 text-xs text-muted">
            <Icon icon="lucide:lock-keyhole" className="h-3.5 w-3.5" />
            Checkout preview by PLUME
          </p>
        </aside>
      </div>
    </section>
  );
}