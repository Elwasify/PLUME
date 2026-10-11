import { useState } from "react";
import { Link } from "react-router-dom";
import { Icon } from "@iconify/react";
import Logo from "../Logo/Logo";
import categories from "../../data/categories";

const columns = [
  {
    title: "Explore",
    links: [
      { label: "Home", to: "/" },
      { label: "Discover", to: "/discover" },
      { label: "Categories", to: "/categories" },
      { label: "About", to: "/about" },
    ],
  },
  {
    title: "Your library",
    links: [
      { label: "Wishlist", to: "/wishlist" },
      { label: "Shopping bag", to: "/cart" },
    ],
  },
  {
    title: "Browse",
    links: categories.slice(0, 5).map((c) => ({
      label: c.name,
      to: `/discover?category=${encodeURIComponent(c.name)}`,
    })),
  },
];

const socials = [
  { label: "GitHub", href: "https://github.com/", icon: "ri:github-fill" },
  { label: "X", href: "https://x.com/", icon: "ri:twitter-x-fill" },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/",
    icon: "ri:linkedin-fill",
  },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Footer() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");

  const onSubmit = (e) => {
    e.preventDefault();
    if (!EMAIL_RE.test(email.trim())) {
      setStatus("error");
      return;
    }
    setStatus("done");
    setEmail("");
  };

  const message =
    status === "done"
      ? "Thanks! This is a demo, so nothing was actually subscribed."
      : status === "error"
        ? "Please enter a valid email address."
        : "Demo only. Your email is not stored or sent.";

  return (
    <footer className="bg-ink text-cream">
      <div className="mx-auto max-w-6xl px-6 py-14 md:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_2fr] lg:gap-16">
          <div className="max-w-sm">
            <Logo light />
            <h2 className="mt-8 font-serif text-2xl leading-tight">
              Stay <em className="text-gold">between</em> the pages
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-cream/60">
              New arrivals, author spotlights and reading lists, straight to
              your inbox.
            </p>

            <form onSubmit={onSubmit} noValidate className="mt-6">
              <label htmlFor="footer-email" className="sr-only">
                Email address
              </label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  id="footer-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (status !== "idle") setStatus("idle");
                  }}
                  placeholder="you@example.com"
                  aria-invalid={status === "error"}
                  aria-describedby="footer-email-message"
                  className="w-full rounded-md border border-cream/20 bg-transparent px-4 py-3 text-sm text-cream outline-none transition placeholder:text-cream/40 focus:border-gold sm:flex-1"
                />
                <button
                  type="submit"
                  className="flex items-center justify-center gap-2 rounded-md bg-gold px-5 py-3 text-sm font-medium text-ink transition hover:bg-gold/90"
                >
                  Subscribe
                  <Icon icon="lucide:arrow-right" className="h-4 w-4" />
                </button>
              </div>
              <p
                id="footer-email-message"
                role="status"
                className={`mt-3 text-xs ${
                  status === "idle" ? "text-cream/50" : "text-gold"
                }`}
              >
                {message}
              </p>
            </form>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {columns.map((col) => (
              <div key={col.title}>
                <h3 className="font-serif text-lg text-cream">{col.title}</h3>
                <ul className="mt-5 flex flex-col gap-3">
                  {col.links.map((l) => (
                    <li key={l.to}>
                      <Link
                        to={l.to}
                        className="text-sm text-cream/60 transition-colors hover:text-gold"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-cream/15 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-cream/60">
            © {new Date().getFullYear()} PLUME. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noreferrer"
                aria-label={s.label}
                className="rounded-md border border-cream/15 p-2.5 text-cream/60 transition hover:border-gold hover:text-gold"
              >
                <Icon icon={s.icon} className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
