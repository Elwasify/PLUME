import { Link } from "react-router-dom";
import { Icon } from "@iconify/react";
import usePageTitle from "../../hooks/usePageTitle";

export default function NotFound() {
  usePageTitle("Page not found");

  return (
    <section className="mx-auto max-w-3xl px-6 py-24 text-center md:py-32">
      <p className="font-['Inter',sans-serif] text-7xl font-light tracking-tight text-burgundy md:text-8xl">
        404
      </p>
      <span className="mx-auto mt-6 block h-px w-12 bg-gold" />
      <p className="mt-6 text-[11px] uppercase tracking-[0.3em] text-gold-deep">
        Page not found
      </p>
      <h1 className="mt-3 text-4xl md:text-5xl">
        This page is not on our <em className="text-burgundy">shelves</em>
      </h1>
      <p className="mx-auto mt-6 max-w-md leading-relaxed text-muted">
        The link may be wrong or the page may have moved. Let’s get you back to
        the books.
      </p>

      <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
        <Link
          to="/"
          className="flex items-center gap-3 bg-burgundy px-7 py-3.5 text-xs uppercase tracking-[0.2em] text-cream transition hover:bg-burgundy/90"
        >
          <Icon icon="lucide:arrow-left" className="h-4 w-4" />
          Back to home
        </Link>
        <Link
          to="/discover"
          className="flex items-center gap-3 border border-line px-7 py-3.5 text-xs uppercase tracking-[0.2em] transition hover:border-burgundy hover:text-burgundy"
        >
          <Icon icon="lucide:search" className="h-4 w-4" />
          Discover books
        </Link>
      </div>
    </section>
  );
}
