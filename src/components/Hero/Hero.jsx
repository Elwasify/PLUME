import { useState } from "react";
import { Link } from "react-router-dom";
import { Icon } from "@iconify/react";
import { formatPrice, toItem } from "../../context/shopUtils";
import { featuredBooks } from "../../data/featuredBooks";

const perks = [
  {
    icon: "lucide:book-open",
    title: "Curated classics",
    text: "Hand-picked titles",
  },
  {
    icon: "lucide:heart",
    title: "Wishlist",
    text: "Save books for later",
  },
  {
    icon: "lucide:shopping-bag",
    title: "Easy bag",
    text: "Ready to checkout",
  },
];

export default function Hero() {
  const [index, setIndex] = useState(0);
  const total = featuredBooks.length;
  const go = (i) => setIndex((i + total) % total);

  const current = featuredBooks[index];
  const prevSlide = featuredBooks[(index - 1 + total) % total];
  const nextSlide = featuredBooks[(index + 1) % total];
  const { price } = toItem(current.catalogBook);

  return (
    <section className="grid border-b border-line lg:grid-cols-2">
      <div className="flex flex-col justify-center px-4 py-10 sm:px-6 sm:py-12 md:px-12 lg:py-24">
        <h1 className="mt-6 text-4xl leading-[1.05] sm:mt-8 sm:text-5xl md:text-7xl">
          Find Yourself <em>Between</em> the Pages.
        </h1>

        <p className="mt-8 max-w-lg text-lg leading-relaxed text-muted">
          Discover timeless classics, contemporary voices, and extraordinary
          stories chosen for curious minds.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3 sm:mt-10 sm:gap-4">
          <Link
            to="/discover"
            className="flex items-center gap-3 rounded-md bg-burgundy px-5 py-4 text-sm text-cream shadow-lg shadow-burgundy/20 transition hover:bg-burgundy/90 sm:px-7"
          >
            Explore the Collection
            <Icon icon="lucide:arrow-right" className="h-4 w-4" />
          </Link>
          <Link
            to="/about"
            className="flex items-center gap-3 rounded-md border border-line bg-white px-5 py-4 text-sm transition hover:border-burgundy hover:text-burgundy sm:px-7"
          >
            <Icon icon="lucide:book-open" className="h-4 w-4" />
            Our Literary World
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-3 divide-x divide-line border-y border-line sm:mt-12">
          {perks.map((perk) => (
            <div key={perk.title} className="px-2 py-6 text-center sm:px-6">
              <Icon
                icon={perk.icon}
                className="mx-auto h-6 w-6 text-gold-deep md:h-7 md:w-7"
              />
              <p className="mt-3 font-serif text-sm leading-snug text-ink sm:text-base">
                {perk.title}
              </p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.15em] text-muted sm:text-[11px]">
                {perk.text}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="p-3 sm:p-4 md:p-8">
        <div className="mx-auto flex h-full max-w-xl flex-col rounded-3xl bg-ink px-4 py-8 text-center text-cream shadow-2xl sm:px-6 sm:py-10">
          <p className="text-[11px] uppercase tracking-[0.35em] text-gold">
            The Plume Selection
          </p>

          <div className="relative mt-8 flex h-72 items-center justify-center sm:mt-10 sm:h-80">
            <img
              src={prevSlide.image}
              alt=""
              aria-hidden="true"
              className="absolute left-6 top-1/2 hidden h-64 w-44 -translate-y-1/2 -rotate-6 rounded-sm object-cover opacity-80 shadow-xl sm:block"
            />
            <img
              src={nextSlide.image}
              alt=""
              aria-hidden="true"
              className="absolute right-6 top-1/2 hidden h-64 w-44 -translate-y-1/2 rotate-6 rounded-sm object-cover opacity-80 shadow-xl sm:block"
            />
            <img
              key={index}
              src={current.image}
              alt={`Cover of ${current.title}`}
              className="relative z-10 h-72 w-48 rounded-sm object-cover shadow-2xl sm:h-80 sm:w-56"
            />

            <button
              type="button"
              onClick={() => go(index - 1)}
              aria-label="Previous"
              className="absolute left-0 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-cream/30 bg-ink/60 transition hover:border-gold hover:text-gold"
            >
              <Icon icon="lucide:chevron-left" className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => go(index + 1)}
              aria-label="Next"
              className="absolute right-0 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-cream/30 bg-ink/60 transition hover:border-gold hover:text-gold"
            >
              <Icon icon="lucide:chevron-right" className="h-5 w-5" />
            </button>
          </div>

          <h2 className="mt-8 font-serif text-2xl sm:mt-10 sm:text-3xl md:text-4xl">
            {current.title}
          </h2>
          <p className="mt-3 text-xs uppercase tracking-[0.3em] text-gold">
            {current.author} · {current.year}
          </p>
          {current.bio && (
            <p className="mt-3 text-sm text-cream/70">{current.bio}</p>
          )}
          <p className="mt-5 font-['Inter',sans-serif] text-2xl font-light tracking-tight text-gold sm:text-3xl">
            {formatPrice(price)}
          </p>

          <Link
            to={`/books/${current.id}`}
            className="mt-6 text-xs uppercase tracking-[0.3em] text-gold"
          >
            View details
          </Link>

          <div className="mt-8 flex justify-center gap-2">
            {featuredBooks.map((book, i) => (
              <button
                key={book.id}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Show ${book.title}`}
                aria-current={i === index}
                className={`h-2 rounded-full transition-all ${
                  i === index ? "w-8 bg-gold" : "w-2 bg-cream/30"
                }`}
              />
            ))}
          </div>

          {current.quote && (
            <p className="mx-auto mt-8 flex max-w-sm items-center justify-center gap-3 font-serif text-xs italic text-cream/80 sm:text-sm">
              <Icon icon="lucide:quote" className="h-4 w-4 shrink-0 text-gold" />
              <span>
                {current.quote}
                <br />
                — {current.author}, {current.title}
              </span>
            </p>
            )}
        </div>
      </div>
    </section>
  );
}
