import { useState } from "react";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");

  const onSubmit = (e) => {
    e.preventDefault();
    const value = email.trim().toLowerCase();
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

    if (!valid) {
      setStatus("error");
      return;
    }

    try {
      const saved = JSON.parse(localStorage.getItem("subscribers") || "[]");
      if (saved.includes(value)) {
        setStatus("duplicate");
        return;
      }
      localStorage.setItem("subscribers", JSON.stringify([...saved, value]));
    } catch {
      setStatus("storage-error");
      return;
    }

    setStatus("success");
    setEmail("");
  };

  return (
    <section className="border-y border-line bg-secondary/40">
      <div className="mx-auto max-w-3xl px-6 py-20 text-center">
        <p className="text-[11px] uppercase tracking-[0.3em] text-gold-deep">
          La Lettre Plume
        </p>
        <h2 className="mt-4 text-3xl md:text-4xl">
          A letter for <em className="text-burgundy">curious</em> readers.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-muted">
          Occasional notes on books, authors and ideas worth your time.
        </p>

        <form
          onSubmit={onSubmit}
          noValidate
          className="mx-auto mt-8 flex max-w-lg flex-col gap-3 sm:flex-row"
        >
          <label htmlFor="newsletter-email" className="sr-only">
            Email address
          </label>
          <input
            id="newsletter-email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setStatus("idle");
            }}
            placeholder="Your email address"
            className="w-full border border-line bg-white px-4 py-3 text-sm outline-none focus:border-burgundy"
          />
          <button
            type="submit"
            className="bg-burgundy px-7 py-3 text-xs uppercase tracking-[0.2em] text-cream transition hover:bg-burgundy/90"
          >
            Subscribe
          </button>
        </form>

        <p aria-live="polite" className="mt-4 min-h-6 text-sm">
          {status === "success" && (
            <span className="text-gold-deep">Thank you for your interest.</span>
          )}
          {status === "error" && (
            <span className="text-burgundy">
              Please enter a valid email address.
            </span>
          )}
          {status === "duplicate" && (
            <span className="text-burgundy">You are already subscribed.</span>
          )}
          {status === "storage-error" && (
            <span className="text-burgundy">
              We could not save your email in this browser.
            </span>
          )}
        </p>
      </div>
    </section>
  );
}
