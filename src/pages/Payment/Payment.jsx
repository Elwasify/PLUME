import { useState } from "react";
import { Link } from "react-router-dom";
import { Icon } from "@iconify/react";
import BookCover from "../../components/BookCover/BookCover";
import CheckoutSteps from "../../components/CheckoutSteps/CheckoutSteps";
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
    name: "city",
    label: "City",
    autoComplete: "address-level2",
  },
  {
    name: "address",
    label: "Street address",
    autoComplete: "street-address",
    wide: true,
  },
];

const governorates = [
  "Cairo",
  "Alexandria",
  "Port Said",
  "Suez",
  "Damietta",
  "Dakahlia",
  "Sharkia",
  "Qalyubia",
  "Kafr El Sheikh",
  "Gharbia",
  "Monufia",
  "Beheira",
  "Ismailia",
  "Giza",
  "Beni Suef",
  "Fayoum",
  "Minya",
  "Assiut",
  "Sohag",
  "Qena",
  "Aswan",
  "Luxor",
  "Red Sea",
  "New Valley",
  "Matrouh",
  "North Sinai",
  "South Sinai",
];

const phonePattern = /^\+?[0-9]{10,15}$/;
const SHIPPING_KEY = "plume:last-shipping";
const PAYMENT_DRAFT_KEY = "plume:payment-draft";

const inputClass =
  "mt-2 w-full border border-line bg-cream px-3 py-3 text-sm outline-none transition placeholder:text-muted/70 focus:border-burgundy focus:ring-2 focus:ring-burgundy/15";

function readDraft() {
  const defaults = {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    governorate: "",
    city: "",
    country: "Egypt",
  };

  try {
    const saved = JSON.parse(sessionStorage.getItem(PAYMENT_DRAFT_KEY) || "null");
    if (!saved || typeof saved !== "object") return defaults;
    const savedCity = typeof saved.city === "string" ? saved.city : "";
    return {
      firstName: typeof saved.firstName === "string" ? saved.firstName : "",
      lastName: typeof saved.lastName === "string" ? saved.lastName : "",
      email: typeof saved.email === "string" ? saved.email : "",
      phone: typeof saved.phone === "string" ? saved.phone : "",
      address: typeof saved.address === "string" ? saved.address : "",
      governorate:
        typeof saved.governorate === "string" &&
        governorates.includes(saved.governorate)
          ? saved.governorate
          : governorates.includes(savedCity)
            ? savedCity
            : "",
      city: governorates.includes(savedCity)
        ? ""
        : savedCity,
      country: "Egypt",
    };
  } catch {
    return defaults;
  }
}

function saveDraft(draft) {
  try {
    sessionStorage.setItem(PAYMENT_DRAFT_KEY, JSON.stringify(draft));
  } catch {
    void 0;
  }
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
  const { cart, cartCount, cartTotal } = useShop();
  const [formData, setFormData] = useState(readDraft);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [checkoutUrl, setCheckoutUrl] = useState("");
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [iframeFailed, setIframeFailed] = useState(false);
  usePageTitle("Payment");

  const currentStep = checkoutUrl ? 3 : 2;

  const updateDraft = (name, value) => {
    const nextDraft = { ...formData, [name]: value, country: "Egypt" };
    setFormData(nextDraft);
    saveDraft(nextDraft);
  };

  const submitOrder = async (event) => {
    event.preventDefault();
    if (submitting) return;

    const data = Object.fromEntries(new FormData(event.currentTarget));
    const phone = (data.phone || "").trim().replace(/[\s-]/g, "");
    const nextErrors = {};

    if (!data.firstName?.trim())
      nextErrors.firstName = "Please enter your first name.";
    if (!data.lastName?.trim())
      nextErrors.lastName = "Please enter your last name.";
    if (!/^\S+@\S+\.\S+$/.test(data.email || ""))
      nextErrors.email = "Please enter a valid email address.";
    if (!phonePattern.test(phone))
      nextErrors.phone = "Please enter a valid phone number.";
    if (!governorates.includes(data.governorate))
      nextErrors.governorate = "Please select a valid governorate.";
    if (!data.city?.trim()) nextErrors.city = "Please enter your city.";
    if (!data.address?.trim())
      nextErrors.address = "Please enter your street address.";

    setErrors(nextErrors);
    setServerError("");
    if (Object.keys(nextErrors).length > 0) {
      const first = Object.keys(nextErrors)[0];
      document.getElementById("payment-" + first)?.focus();
      return;
    }

    const nextDraft = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      address: data.address,
      governorate: data.governorate,
      city: data.city,
      country: "Egypt",
    };
    setFormData(nextDraft);
    saveDraft(nextDraft);
    setSubmitting(true);

    try {
      const response = await fetch("/api/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.map((item) => ({ id: item.id, qty: item.qty })),
          customer: {
            firstName: data.firstName.trim(),
            lastName: data.lastName.trim(),
            email: data.email.trim(),
            phone,
          },
          paymentMethod: "card",
        }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok || !result.url) {
        const providerStatus = Number(result.providerStatus);
        let errorMessage =
          "We could not start the payment. Please try again.";

        if (result.code === "server_not_configured") {
          errorMessage =
            "Payment setup is incomplete on the server. Check the Paymob environment settings.";
        } else if (result.code === "provider_error") {
          errorMessage = `Paymob rejected the checkout${Number.isInteger(providerStatus) ? ` (HTTP ${providerStatus})` : ""}. Check that the card integration and Paymob keys belong to the same account and mode.`;
        } else if (result.code === "provider_unavailable") {
          errorMessage = "Could not reach Paymob. Check the connection and try again.";
        }

        setServerError(errorMessage);
        setSubmitting(false);
        return;
      }

      try {
        sessionStorage.setItem(
          SHIPPING_KEY,
          JSON.stringify({
            reference: result.reference,
            firstName: data.firstName.trim(),
            lastName: data.lastName.trim(),
            email: data.email.trim(),
            phone,
            address: data.address.trim(),
            governorate: data.governorate,
            city: data.city.trim(),
            country: "Egypt",
          })
        );
      } catch {
        void 0;
      }

      setIframeFailed(false);
      setIframeLoaded(false);
      setCheckoutUrl(result.url);
      setSubmitting(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setServerError(
        "Network problem. Please check your connection and try again."
      );
      setSubmitting(false);
    }
  };

  const renderField = (field) => {
    const fieldId = "payment-" + field.name;
    const errorId = fieldId + "-error";
    return (
      <label
        key={field.name}
        htmlFor={fieldId}
        className={
          "block text-xs text-ink/80 " + (field.wide ? "sm:col-span-2" : "")
        }
      >
        {field.label}
        <input
          id={fieldId}
          name={field.name}
          type={field.type || "text"}
          autoComplete={field.autoComplete}
          value={formData[field.name]}
          onChange={(event) => updateDraft(field.name, event.target.value)}
          aria-invalid={Boolean(errors[field.name])}
          aria-describedby={errors[field.name] ? errorId : undefined}
          className={
            inputClass + (errors[field.name] ? " border-burgundy" : "")
          }
        />
        {errors[field.name] && (
          <span
            id={errorId}
            role="alert"
            className="mt-1 flex items-center gap-1 text-xs text-burgundy"
          >
            <Icon icon="lucide:alert-circle" className="h-3.5 w-3.5" />
            {errors[field.name]}
          </span>
        )}
      </label>
    );
  };

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
        <CheckoutSteps current={currentStep} />
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
              Payments are processed securely by Paymob. Your payment details
              are entered on Paymob&apos;s secure form and never reach this website.
            </p>
          </div>

          {checkoutUrl && (
            <div className="mt-10">
              <button
                type="button"
                onClick={() => {
                  setCheckoutUrl("");
                  setIframeLoaded(false);
                }}
                className="mb-4 inline-flex cursor-pointer items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted transition hover:text-burgundy"
              >
                <Icon icon="lucide:arrow-left" className="h-4 w-4" />
                Back to details
              </button>
              <div className="overflow-hidden border border-burgundy/20 bg-white shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line bg-secondary/50 px-5 py-4 sm:px-6">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.24em] text-gold-deep">
                      Secure checkout
                    </p>
                    <h2 className="mt-1 font-serif text-xl text-burgundy">
                      Pay with card
                    </h2>
                  </div>
                  <span className="inline-flex items-center gap-2 text-xs text-muted">
                    <Icon icon="lucide:lock-keyhole" className="h-4 w-4 text-burgundy" />
                    Protected by Paymob
                  </span>
                </div>
                <div className="bg-white p-2 sm:p-4">
                  {!iframeLoaded && !iframeFailed && (
                    <p role="status" className="mb-3 text-sm text-muted">
                      Loading the secure Paymob card form...
                    </p>
                  )}
                  <iframe
                    src={checkoutUrl}
                    title="Secure payment by Paymob"
                    allow="payment"
                    onLoad={() => setIframeLoaded(true)}
                    onError={() => setIframeFailed(true)}
                    className="h-[760px] w-full border-0 bg-white"
                  />
                </div>
              </div>
              <p className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-muted">
                <Icon icon="lucide:shield-check" className="mt-0.5 h-4 w-4 shrink-0 text-gold-deep" />
                Your bank may open a separate secure verification step before returning you here.
              </p>
              {iframeFailed && (
                <p role="alert" className="mt-3 text-sm text-burgundy">
                  The secure payment form did not load. Use the redirect link to
                  continue with Paymob.
                </p>
              )}
              {iframeFailed && (
                <div className="mt-4">
                  <a
                    href={checkoutUrl}
                    className="text-xs text-burgundy underline underline-offset-4"
                  >
                    Open Paymob checkout in this window
                  </a>
                </div>
              )}
            </div>
          )}

          <form
            onSubmit={submitOrder}
            noValidate
            className={"mt-10 space-y-10 " + (checkoutUrl ? "hidden" : "")}
          >
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
                <label
                  htmlFor="payment-governorate"
                  className="block text-xs text-ink/80"
                >
                  Governorate
                  <select
                    id="payment-governorate"
                    name="governorate"
                    autoComplete="address-level1"
                    value={formData.governorate}
                    onChange={(event) =>
                      updateDraft("governorate", event.target.value)
                    }
                    aria-invalid={Boolean(errors.governorate)}
                    aria-describedby={
                      errors.governorate
                        ? "payment-governorate-error"
                        : undefined
                    }
                    className={
                      inputClass +
                      (errors.governorate ? " border-burgundy" : "")
                    }
                  >
                    <option value="">Select your governorate</option>
                    {governorates.map((governorate) => (
                      <option key={governorate} value={governorate}>
                        {governorate}
                      </option>
                    ))}
                  </select>
                  {errors.governorate && (
                    <span
                      id="payment-governorate-error"
                      role="alert"
                      className="mt-1 flex items-center gap-1 text-xs text-burgundy"
                    >
                      <Icon icon="lucide:alert-circle" className="h-3.5 w-3.5" />
                      {errors.governorate}
                    </span>
                  )}
                </label>
                {addressFields.map(renderField)}
              </div>
            </fieldset>

            <fieldset>
              <legend className="w-full">
                <SectionTitle number="3" title="Payment method" />
              </legend>
              <div className="mt-5 flex items-start gap-3 border border-burgundy bg-white/70 p-4">
                <Icon
                  icon="lucide:credit-card"
                  className="mt-0.5 h-4 w-4 shrink-0 text-burgundy"
                />
                <div>
                  <p className="font-medium">Bank card</p>
                  <p className="mt-1 text-xs text-muted">
                    Pay securely with Visa, Mastercard, and other supported cards.
                  </p>
                </div>
              </div>
            </fieldset>

            <div>
              {serverError && (
                <p
                  role="alert"
                  className="mb-4 flex items-start gap-2 border border-burgundy bg-white/70 p-3 text-sm text-burgundy"
                >
                  <Icon
                    icon="lucide:alert-circle"
                    className="mt-0.5 h-4 w-4 shrink-0"
                  />
                  {serverError}
                </p>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="flex min-h-12 w-full cursor-pointer items-center justify-center gap-3 bg-burgundy px-6 py-3.5 text-xs uppercase tracking-[0.2em] text-cream transition hover:bg-burgundy/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? (
                  "Opening secure card payment..."
                ) : (
                  <>
                    Pay with bank card
                    <span aria-hidden="true">·</span>
                    <span className="font-['Inter',sans-serif]">
                      {formatPrice(cartTotal)}
                    </span>
                    <Icon icon="lucide:arrow-right" className="h-4 w-4" />
                  </>
                )}
              </button>
              <p className="mt-3 flex items-center justify-center gap-2 text-xs text-muted">
                <Icon icon="lucide:lock-keyhole" className="h-3.5 w-3.5" />
                Secure payment by Paymob.
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
                  alt={"Cover of " + item.title}
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
