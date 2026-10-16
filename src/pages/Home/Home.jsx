import { Link } from "react-router-dom";
import { Icon } from "@iconify/react";
import useBooks from "../../hooks/useBooks";
import BookCard from "../../components/BookCard/BookCard";
import Newsletter from "../../components/Newsletter/Newsletter";
import categories from "../../data/categories";
import Hero from "../../components/Hero/Hero";
import usePageTitle from "../../hooks/usePageTitle";

const topics = [
  { label: "Stoicism", q: "stoicism" },
  { label: "Paris essays", q: "paris essays" },
  { label: "Women in literature", q: "women literature" },
];

const pillars = [
  {
    n: "I",
    title: "Literature",
    text: "Every title is a doorway, not a product.",
  },
  {
    n: "II",
    title: "Imagination",
    text: "Browse like you wander: by cover, name or subject.",
  },
  {
    n: "III",
    title: "Discovery",
    text: "From forgotten classics to new voices.",
  },
];

export default function Home() {
  usePageTitle("");

  const { books, loading, error } = useBooks({ category: "Fiction" });

  return (
    <div>
      <Hero />

      <section className="border-b border-line">
        <div className="mx-auto grid max-w-7xl md:grid-cols-3">
          {pillars.map((p) => (
            <div
              key={p.n}
              className="border-b border-line p-8 last:border-b-0 md:border-b-0 md:border-r md:p-10 md:last:border-r-0"
            >
              <p className="font-serif text-4xl italic text-gold">{p.n}</p>
              <h2 className="mt-4 text-2xl">{p.title}</h2>
              <p className="mt-3 leading-relaxed text-muted">{p.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-14 md:py-20">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-gold-deep">
              Selection
            </p>
            <h2 className="mt-3 text-3xl md:text-4xl">
              Featured <em className="text-burgundy">this week</em>
            </h2>
          </div>
          <Link
            to="/discover"
            className="shrink-0 text-xs uppercase tracking-[0.2em] text-burgundy underline decoration-gold underline-offset-8"
          >
            View all
          </Link>
        </div>

        {loading && (
          <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-[2/3] animate-pulse bg-gold/20" />
            ))}
          </div>
        )}

        {error && (
          <p className="mt-10 text-burgundy">
            We could not load the featured books right now.
          </p>
        )}

        {!loading && !error && (
          <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
            {books.slice(0, 4).map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        )}
      </section>

      <section className="border-t border-line bg-secondary/40">
        <div className="mx-auto max-w-6xl px-6 py-14 md:py-20">
          <p className="text-[11px] uppercase tracking-[0.3em] text-gold-deep">
            Browse
          </p>
          <h2 className="mt-3 text-3xl md:text-4xl">
            Choose your <em className="text-burgundy">universe</em>
          </h2>

          <div className="mt-10 grid grid-cols-2 border-l border-t border-line md:grid-cols-3">
            {categories.map((c) => (
              <Link
                key={c.name}
                to={`/discover?category=${c.name}`}
                className="group flex items-center gap-3 border-b border-r border-line bg-cream p-5 transition hover:bg-white md:gap-4 md:p-6"
              >
                <Icon
                  icon={c.icon}
                  className="h-6 w-6 shrink-0 text-gold-deep"
                />
                <span className="font-serif text-base transition group-hover:text-burgundy md:text-lg">
                  {c.name}
                </span>
              </Link>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-3 text-sm">
            <span className="text-muted">Or explore:</span>
            {topics.map((t) => (
              <Link
                key={t.q}
                to={`/discover?q=${encodeURIComponent(t.q)}`}
                className="border border-line px-4 py-1.5 transition hover:border-burgundy hover:text-burgundy"
              >
                {t.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Newsletter />
    </div>
  );
}
