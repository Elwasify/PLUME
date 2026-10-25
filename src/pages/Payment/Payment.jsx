import { useState } from "react";
import { Link } from "react-router-dom";
import { Icon } from "@iconify/react";
import BookCover from "../../components/BookCover/BookCover";
import { useShop } from "../../context/useShop";
import { formatPrice } from "../../context/shopUtils";
import usePageTitle from "../../hooks/usePageTitle";

const contactFields = [
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
];

const addressFields = [
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

const methods = {
  card: {
    label: "Bank card",
    hint: "Visa, Mastercard, and supported cards",
    icon: "lucide:credit-card",
  },
  wallet: {
    label: "Mobile wallet",
    hint: "Pay with a supported wallet",
    icon: "lucide:smartphone",
  },
};

const stepNames = ["Bag", "Details", "Confirmation"];

const phonePattern = /^[+\d][\d\s-]{6,18}$/;

const inputClass =
  "mt-2 w-full border border-line bg-cream px-3 py-3 text-sm outline-none transition placeholder:text-muted/70 focus:border-burgundy focus:ring-2 focus:ring-burgundy/15";

function Steps({ current }) {
  return (
    <ol className="flex items-center" aria-label="Checkout progress">
      {stepNames.map((name, index) => {
        const number = index + 1;
        const done = number < current || current === 3;
        const active = number === current && current !== 3;
        return (
          <li key={name} className="flex items-center">
            <span
              className={`flex h-7 w-7 items-center justify-center rounded-full border text-[11px] font-['Inter',sans-serif] ${
                done
                  ? "border-burgundy bg-burgundy text-cream"
                  : active
                    ? "border-burgundy text-burgundy"
                    : "border-line text-muted"
              }`}
              aria-current={active ? "step" : undefined}
            >
              {done ? (
                <Icon icon="lucide:check" className="h-3.5 w-3.5" />
              ) : (
                number
              )}
            </span>
            <span
              className={`ml-2 text-[10px] uppercase tracking-[0.18em] ${
                done || active ? "text-burgundy" : "text-muted"
              }`}
            >
              {name}
            </span>
            {number < stepNames.length && (
              <span
                aria-hidden="true"
                className={`mx-3 h-px w-6 sm:w-12 ${
                  number < current || current === 3 ? "bg-burgundy" : "bg-line"
                }`}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}

function SectionTitle({ number, title }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-burgundy text-[11px] text-cream font-['Inter',sans-serif]">
        {number}
      </span>
      <h2 className="font-serif text-2xl">{title}</h2>
    </div>
  );
}

export default function Payment() {
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
      lastName: data.lastName.trim(),
      email: data.email.trim(),
      phone: data.phone.trim(),
      address: data.address.trim(),
      city: data.city.trim(),
      country: data.country,
      method,
      items: cart.map((item) => ({ ...item })),
      count: cartCount,
      total: cartTotal,
    });
    clearCart();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderField = (field) => (
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
            errors[field.name] ? `payment-${field.name}-error` : undefined
          }
          className={`${inputClass} ${
            errors[field.name] ? "border-burgundy" : ""
          }`}
        />
      )}
      {errors[field.name] && (
        <span
          id={`payment-${field.name}-error`}
          role="alert"
          className="mt-1 flex items-center gap-1 text-xs text-burgundy"
        >
          <Icon icon="lucide:alert-circle" className="h-3.5 w-3.5" />
          {errors[field.name]}
        </span>
      )}
    </label>
  );

  if (order) {
    const chosen = methods[order.method];
    return (
      <section className="mx-auto max-w-3xl px-6 py-12 md:py-20">
        <Steps current={3} />

        <div className="mt-10 flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-burgundy text-cream">
            <Icon icon="lucide:check" className="h-7 w-7" />
          </span>
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-gold-deep">
              Order {order.number}
            </p>
            <p className="mt-1 text-sm text-muted">Demo order confirmed</p>
          </div>
        </div>

        <h1 className="mt-6 font-serif text-4xl md:text-5xl">
          Thank you, <em className="text-burgundy">{order.firstName}</em>
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-muted">
          A confirmation would be sent to {order.email}. This is a demo order,
          so no payment was taken and no details were sent anywhere.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="border border-line bg-white/50 p-4">
            <p className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-gold-deep">
              <Icon icon="lucide:map-pin" className="h-3.5 w-3.5" />
              Shipping to
            </p>
            <p className="mt-3 text-sm leading-relaxed text-ink/80">
              {order.firstName} {order.lastName}
              <br />
              {order.address}
              <br />
              {order.city}, {order.country}
            </p>
          </div>
          <div className="border border-line bg-white/50 p-4">
            <p className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-gold-deep">
              <Icon icon="lucide:mail" className="h-3.5 w-3.5" />
              Contact
            </p>
            <p className="mt-3 break-words text-sm leading-relaxed text-ink/80">
              {order.email}
              <br />
              {order.phone}
            </p>
          </div>
          <div className="border border-line bg-white/50 p-4">
            <p className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-gold-deep">
              <Icon icon={chosen.icon} className="h-3.5 w-3.5" />
              Payment
            </p>
            <p className="mt-3 text-sm leading-relaxed text-ink/80">
              {chosen.label}
              <br />
              Demo, not charged
            </p>
          </div>
        </div>

        <h2 className="mt-10 font-serif text-2xl">Your books</h2>
        <ul className="mt-4 divide-y divide-line border-y border-line">
          {order.items.map((item) => (
            <li key={item.id} className="flex gap-4 py-4">
              <BookCover
                src={item.cover}
                alt={`Cover of ${item.title}`}
                title={item.title}
                className="h-20 w-14 shrink-0 border border-gold/40 object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 font-serif text-base text-burgundy">
                  {item.title}
                </p>
                <p className="mt-1 text-xs text-muted">
                  {item.authors.length === 0
                    ? "Unknown author"
                    : item.authors.join(", ")}
                </p>
                <p className="mt-1 text-xs text-muted">Qty {item.qty}</p>
              </div>
              <p className="shrink-0 font-['Inter',sans-serif] text-sm font-light text-burgundy">
                {formatPrice(item.price * item.qty)}
              </p>
            </li>
          ))}
        </ul>

        <dl className="mt-5 space-y-2 text-sm">
          <div className="flex justify-between text-muted">
            <dt>Shipping and taxes</dt>
            <dd>Not calculated</dd>
          </div>
          <div className="flex items-baseline justify-between border-t border-line pt-3">
            <dt>Total ({order.count} items)</dt>
            <dd className="font-['Inter',sans-serif] text-2xl font-light text-burgundy">
              {formatPrice(order.total)}
            </dd>
          </div>
        </dl>

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
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex cursor-pointer items-center gap-2 px-4 py-3.5 text-xs uppercase tracking-[0.2em] text-muted transition hover:text-burgundy"
          >
            <Icon icon="lucide:printer" className="h-4 w-4" />
            Print receipt
          </button>
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
        <p className="mt-3 text-muted">
          Add a book before continuing to payment.
        </p>
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
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          to="/cart"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted transition hover:text-burgundy"
        >
          <Icon icon="lucide:arrow-left" className="h-4 w-4" />
          Back to bag
        </Link>
        <Steps current={2} />
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-14">
        <div>
          <p className="text-[11px] uppercase tracking-[0.3em] text-gold-deep">
            Checkout
          </p>
          <h1 className="mt-3 font-serif text-4xl md:text-5xl">
            Payment <em className="text-burgundy">details</em>
          </h1>
          <div className="mt-6 flex items-start gap-3 border border-gold/50 bg-secondary/40 p-4 text-sm leading-relaxed text-ink/80">
            <Icon
              icon="lucide:info"
              className="mt-0.5 h-4 w-4 shrink-0 text-gold-deep"
            />
            <p>
              This is a portfolio demo. Nothing on this page is sent anywhere,
              and no payment is taken.
            </p>
          </div>

          <form onSubmit={submitOrder} noValidate className="mt-10 space-y-10">
            <fieldset>
              <legend className="w-full">
                <SectionTitle number="1" title="Contact" />
              </legend>
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                {contactFields.map(renderField)}
              </div>
            </fieldset>

            <fieldset>
              <legend className="w-full">
                <SectionTitle number="2" title="Shipping address" />
              </legend>
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                {addressFields.map(renderField)}
              </div>
            </fieldset>

            <fieldset>
              <legend className="w-full">
                <SectionTitle number="3" title="Payment method" />
              </legend>
              <p className="mt-2 text-sm text-muted">
                No card or wallet details are collected in this demo.
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {Object.entries(methods).map(([key, item]) => (
                  <label
                    key={key}
                    className={`relative flex cursor-pointer items-start gap-3 border p-4 transition ${
                      method === key
                        ? "border-burgundy bg-white/70 shadow-sm"
                        : "border-line hover:border-burgundy/50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={key}
                      checked={method === key}
                      onChange={() => setMethod(key)}
                      className="mt-1 accent-burgundy"
                    />
                    <span>
                      <span className="flex items-center gap-2 font-medium">
                        <Icon
                          icon={item.icon}
                          className="h-4 w-4 text-burgundy"
                        />
                        {item.label}
                      </span>
                      <span className="mt-1 block text-xs text-muted">
                        {item.hint}
                      </span>
                    </span>
                    {method === key && (
                      <Icon
                        icon="lucide:check-circle"
                        className="absolute right-3 top-3 h-4 w-4 text-burgundy"
                      />
                    )}
                  </label>
                ))}
              </div>
            </fieldset>

            <div>
              <button
                type="submit"
                className="flex min-h-12 w-full cursor-pointer items-center justify-center gap-3 bg-burgundy px-6 py-3.5 text-xs uppercase tracking-[0.2em] text-cream transition hover:bg-burgundy/90"
              >
                Place demo order
                <span aria-hidden="true">·</span>
                <span className="font-['Inter',sans-serif]">
                  {formatPrice(cartTotal)}
                </span>
                <Icon icon="lucide:arrow-right" className="h-4 w-4" />
              </button>
              <p className="mt-3 flex items-center justify-center gap-2 text-xs text-muted">
                <Icon icon="lucide:lock-keyhole" className="h-3.5 w-3.5" />
                Checkout preview by PLUME. No real payment.
              </p>
            </div>
          </form>
        </div>

        <aside className="h-fit border border-line bg-white/50 p-6 lg:sticky lg:top-36">
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
            <div className="flex justify-between text-muted">
              <dt>Shipping and taxes</dt>
              <dd>Not calculated</dd>
            </div>
            <div className="flex items-baseline justify-between border-t border-line pt-3">
              <dt>Total</dt>
              <dd className="font-['Inter',sans-serif] text-xl font-light text-burgundy">
                {formatPrice(cartTotal)}
              </dd>
            </div>
          </dl>
        </aside>
      </div>
    </section>
  );
}
