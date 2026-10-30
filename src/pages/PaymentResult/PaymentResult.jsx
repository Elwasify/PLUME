import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useShop } from "../../context/useShop";
import usePageTitle from "../../hooks/usePageTitle";

const SHIPPING_KEY = "plume:last-shipping";
const PAYMENT_STATUSES = new Set([
  "success",
  "pending",
  "failed",
  "cancelled",
  "refunded",
  "not_found",
]);

function readShipping() {
  try {
    const raw = sessionStorage.getItem(SHIPPING_KEY);
    const saved = raw ? JSON.parse(raw) : null;
    if (!saved || typeof saved !== "object") return null;

    const readText = (value, maxLength = 160) =>
      typeof value === "string" ? value.slice(0, maxLength) : "";

    return {
      reference: readText(saved.reference, 80),
      firstName: readText(saved.firstName, 50),
      lastName: readText(saved.lastName, 50),
      email: readText(saved.email, 100),
      phone: readText(saved.phone, 20),
      address: readText(saved.address),
      governorate: readText(saved.governorate, 80),
      city: readText(saved.city, 80),
      country: readText(saved.country, 40),
    };
  } catch {
    return null;
  }
}

function formatAmount(amountCents, currency) {
  if (!Number.isSafeInteger(Number(amountCents)) || !currency) return "";
  try {
    return new Intl.NumberFormat("en-EG", {
      style: "currency",
      currency,
    }).format(Number(amountCents) / 100);
  } catch {
    return `${currency} ${(Number(amountCents) / 100).toFixed(2)}`;
  }
}

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-EG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default function PaymentResult() {
  const { clearCart } = useShop();
  const [shipping] = useState(readShipping);
  const [result, setResult] = useState(() => ({
    status: shipping?.reference ? "verifying" : "unverified",
  }));
  const [retryCount, setRetryCount] = useState(0);
  const cleared = useRef(false);
  const insideFrame = window.self !== window.top;
  const reference = shipping?.reference || "";
  usePageTitle("Payment result");

  useEffect(() => {
    if (!insideFrame) return;
    try {
      window.top.location.replace(window.location.href);
    } catch {
      void 0;
    }
  }, [insideFrame]);

  useEffect(() => {
    if (insideFrame) return;
    if (!reference) return;

    let active = true;

    fetch("/api/verify-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reference }),
    })
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!active) return;

        if (response.ok && PAYMENT_STATUSES.has(data.status)) {
          setResult(data);
        } else if (response.status === 404) {
          setResult({ status: "unverified" });
        } else {
          setResult({ status: "error" });
        }
      })
      .catch(() => {
        if (active) setResult({ status: "error" });
      });

    return () => {
      active = false;
    };
  }, [insideFrame, reference, retryCount]);

  useEffect(() => {
    if (insideFrame || result.status !== "success" || cleared.current) return;
    cleared.current = true;
    clearCart();
  }, [insideFrame, result.status, clearCart]);

  if (insideFrame) return null;

  const messages = {
    verifying: [
      "lucide:loader-circle",
      "Checking your payment",
      "We are checking this payment directly with Paymob.",
    ],
    success: [
      "lucide:check-circle-2",
      "Thank you for your order",
      "Paymob verified your payment. Keep the order reference below for your records.",
    ],
    pending: [
      "lucide:clock",
      "Your payment is pending",
      "Paymob has not finalized this payment yet. Your bag is still saved; check again shortly.",
    ],
    cancelled: [
      "lucide:circle-x",
      "Payment was cancelled",
      "Paymob reports that this payment was cancelled. Your bag is still saved.",
    ],
    failed: [
      "lucide:x-circle",
      "Payment was not completed",
      "Paymob reports that this payment did not complete. Your bag is still saved, so you can try again.",
    ],
    refunded: [
      "lucide:rotate-ccw",
      "Payment was refunded",
      "Paymob reports that this payment was refunded or reversed. Your bag is still saved.",
    ],
    not_found: [
      "lucide:search-x",
      "No payment was found yet",
      "Paymob has not returned a transaction for this checkout. If your bank shows a charge, confirm its status before trying again.",
    ],
    unverified: [
      "lucide:shield-question",
      "We could not confirm your payment",
      "Your bag is still saved. If your bank shows a charge, confirm its status before trying again.",
    ],
    error: [
      "lucide:cloud-alert",
      "We could not check your payment",
      "We could not reach Paymob to check this payment. Your bag is still saved; try checking again.",
    ],
  };
  const [icon, title, message] = messages[result.status] || messages.error;
  const canRetryCheck = Boolean(reference) && [
    "pending",
    "not_found",
    "error",
  ].includes(result.status);
  const verifiedRows = [
    ["Order number", result.orderNumber],
    ["Order reference", result.reference],
    ["Payment amount", formatAmount(result.amountCents, result.currency)],
    ["Payment date", formatDate(result.paidAt)],
  ].filter(([, value]) => value);

  return (
    <section className="mx-auto max-w-3xl px-6 py-12 text-center md:py-20">
      <Icon
        icon={icon}
        className={
          "mx-auto h-12 w-12 text-burgundy " +
          (result.status === "verifying" ? "animate-spin" : "")
        }
      />
      <h1 className="mt-6 font-serif text-4xl md:text-5xl">{title}</h1>
      <p role="status" className="mx-auto mt-4 max-w-xl text-muted">
        {message}
      </p>

      {result.status === "success" && (
        <div className="mt-10 border border-line bg-white/50 p-6 text-left">
          <h2 className="font-serif text-2xl">Order details</h2>
          <dl className="mt-5 space-y-3 text-sm">
            {verifiedRows.map(([label, value]) => (
              <div key={label} className="flex justify-between gap-4">
                <dt className="text-muted">{label}</dt>
                <dd className="text-right">{value}</dd>
              </div>
            ))}
            {shipping && (shipping.firstName || shipping.lastName) && (
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Name</dt>
                <dd className="text-right">
                  {[shipping.firstName, shipping.lastName].filter(Boolean).join(" ")}
                </dd>
              </div>
            )}
            {shipping?.email && (
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Email</dt>
                <dd className="text-right">{shipping.email}</dd>
              </div>
            )}
            {shipping?.phone && (
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Phone</dt>
                <dd className="text-right">{shipping.phone}</dd>
              </div>
            )}
            {shipping?.address && (
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Ship to</dt>
                <dd className="text-right">
                  {[
                    shipping.address,
                    shipping.city,
                    shipping.governorate,
                    shipping.country,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </dd>
              </div>
            )}
          </dl>
        </div>
      )}

      <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
        {result.status === "success" ? (
          <>
            <Link
              to="/"
              className="inline-flex bg-burgundy px-7 py-3.5 text-xs uppercase tracking-[0.2em] text-cream transition hover:bg-burgundy/90"
            >
              Back to home
            </Link>
            <Link
              to="/discover"
              className="inline-flex border border-line px-7 py-3.5 text-xs uppercase tracking-[0.2em] transition hover:border-burgundy hover:text-burgundy"
            >
              Continue shopping
            </Link>
          </>
        ) : (
          <>
            {canRetryCheck && (
              <button
                type="button"
                onClick={() => {
                  setResult({ status: "verifying" });
                  setRetryCount((count) => count + 1);
                }}
                className="inline-flex cursor-pointer items-center gap-2 bg-burgundy px-7 py-3.5 text-xs uppercase tracking-[0.2em] text-cream transition hover:bg-burgundy/90"
              >
                <Icon icon="lucide:refresh-cw" className="h-4 w-4" />
                Check payment again
              </button>
            )}
            {["failed", "cancelled"].includes(result.status) && (
              <Link
                to="/payment"
                className="inline-flex bg-burgundy px-7 py-3.5 text-xs uppercase tracking-[0.2em] text-cream transition hover:bg-burgundy/90"
              >
                Try payment again
              </Link>
            )}
            <Link
              to="/cart"
              className="inline-flex border border-line px-7 py-3.5 text-xs uppercase tracking-[0.2em] transition hover:border-burgundy hover:text-burgundy"
            >
              Back to bag
            </Link>
          </>
        )}
      </div>
    </section>
  );
}
