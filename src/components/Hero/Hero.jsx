import { useState } from "react";
import { Link } from "react-router-dom";
import { Icon } from "@iconify/react";
import { formatPrice, toItem } from "../../context/shopUtils";
import prideImg from "../../assets/authors/pride-prejudice.jpg";
import strangerImg from "../../assets/authors/the-stranger.jpg";
import nightsImg from "../../assets/authors/white-nights.jpg";
import metaImg from "../../assets/authors/metamorphosis.jpg";
import lesMisImg from "../../assets/authors/les-miserables.jpg";

const slides = [
  {
    image: prideImg,
    title: "Pride and Prejudice",
    author: "Jane Austen",
    year: "1813",
    bio: "1775 — 1817 · Hampshire",
    quote: "I declare after all there is no enjoyment like reading!",
    id: "OL66554W",
  },
  {
    image: strangerImg,
    title: "The Stranger",
    author: "Albert Camus",
    year: "1942",
    bio: "1913 — 1960 · Mondovi",
    quote: "Mother died today.",
    id: "OL1230613W",
  },
  {
    image: nightsImg,
    title: "White Nights",
    author: "Fyodor Dostoevsky",
    year: "1848",
    bio: "1821 — 1881 · Moscow",
    quote: "A whole minute of happiness! Is that too little for a man’s life?",
    id: "OL166952W",
  },
  {
    image: metaImg,
    title: "The Metamorphosis",
    author: "Franz Kafka",
    year: "1915",
    bio: "1883 — 1924 · Prague",
    quote: "He found himself transformed in his bed into a horrible vermin.",
    id: "OL498556W",
  },
  {
    image: lesMisImg,
    title: "Les Misérables",
    author: "Victor Hugo",
    year: "1862",
    bio: "1802 — 1885 · Besançon",
    quote: "Hope is the word which God has written on the brow of every man.",
    id: "OL1063588W",
  },
];

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
    title: "Easy cart",
    text: "Demo checkout",
  },
];

export default function Hero() {
  const [index, setIndex] = useState(0);
  const total = slides.length;
  const go = (i) => setIndex((i + total) % total);

  const current = slides[index];
  const prevSlide = slides[(index - 1 + total) % total];
  const nextSlide = slides[(index + 1) % total];
  const { price, demo } = toItem({
    id: current.id,
    volumeInfo: { title: current.title },
  });

  return (
    <section className="grid border-b border-line lg:grid-cols-2">
      <div className="flex flex-col justify-center px-6 py-12 md:px-12 lg:py-24">
        <p className="flex items-center gap-4 text-[11px] uppercase tracking-[0.3em] text-burgundy">
          <span className="h-px w-12 bg-gold" />
          N° 27 — The Literary Review
        </p>

        <h1 className="mt-8 text-5xl leading-[1.05] md:text-7xl">
          Find Yourself <em>Between</em> the Pages.
        </h1>

        <p className="mt-8 max-w-lg text-lg leading-relaxed text-muted">
          Discover timeless classics, contemporary voices, and extraordinary
          stories chosen for curious minds.
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Link
            to="/discover"
            className="flex items-center gap-3 rounded-md bg-burgundy px-7 py-4 text-sm text-cream shadow-lg shadow-burgundy/20 transition hover:bg-burgundy/90"
          >
            Explore the Collection
            <Icon icon="lucide:arrow-right" className="h-4 w-4" />
          </Link>
          <Link
            to="/about"
            className="flex items-center gap-3 rounded-md border border-line bg-white px-7 py-4 text-sm transition hover:border-burgundy hover:text-burgundy"
          >
            <Icon icon="lucide:book-open" className="h-4 w-4" />
            Our Literary World
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-3 divide-x divide-line border-y border-line">
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

      <div className="p-4 md:p-8">
        <div className="mx-auto flex h-full max-w-xl flex-col rounded-3xl bg-ink px-6 py-10 text-center text-cream shadow-2xl">
          <p className="text-[11px] uppercase tracking-[0.35em] text-gold">
            The Plume Selection
          </p>

          <div className="relative mt-10 flex h-80 items-center justify-center">
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
              className="relative z-10 h-80 w-56 rounded-sm object-cover shadow-2xl"
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

          <h2 className="mt-10 font-serif text-3xl md:text-4xl">
            {current.title}
          </h2>
          <p className="mt-3 text-xs uppercase tracking-[0.3em] text-gold">
            {current.author} · {current.year}
          </p>
          <p className="mt-3 text-sm text-cream/70">{current.bio}</p>
          <p className="mt-5 font-['Inter',sans-serif] text-3xl font-light tracking-tight text-gold">
            {formatPrice(price)}
            {demo && (
              <span className="ml-2 text-xs tracking-normal text-cream/60">
                demo
              </span>
            )}
          </p>

          <Link
            to={`/books/${current.id}`}
            className="mt-6 text-xs uppercase tracking-[0.3em] text-gold"
          >
            View details
          </Link>

          <div className="mt-8 flex justify-center gap-2">
            {slides.map((s, i) => (
              <button
                key={s.title}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Show ${s.title}`}
                aria-current={i === index}
                className={`h-2 rounded-full transition-all ${
                  i === index ? "w-8 bg-gold" : "w-2 bg-cream/30"
                }`}
              />
            ))}
          </div>

          <p className="mx-auto mt-8 flex max-w-sm items-center justify-center gap-3 font-serif text-sm italic text-cream/80">
            <Icon icon="lucide:quote" className="h-4 w-4 shrink-0 text-gold" />
            {current.quote}
          </p>
        </div>
      </div>
    </section>
  );
}
