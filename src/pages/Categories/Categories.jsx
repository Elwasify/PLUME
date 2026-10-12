import { useRef } from "react";
import { Link } from "react-router-dom";
import { Icon } from "@iconify/react";
import categories from "../../data/categories";
import usePageTitle from "../../hooks/usePageTitle";
import duneCover from "../../assets/authors/dune.jpg";
import hobbitCover from "../../assets/authors/the-hobbit.jpg";
import orientCover from "../../assets/authors/murder-on-the-orient-express.jpg";
import sapiensCover from "../../assets/authors/sapines.jpg";
import timeCover from "../../assets/authors/a-brief-history-of-time.jpg";
import meditationsCover from "../../assets/authors/meditations.jpg";
import leanCover from "../../assets/authors/the-lean-startup.jpg";
import waveCover from "../../assets/authors/the-coming-wave.jpg";
import wutheringCover from "../../assets/authors/wuthering-heights.jpeg";

const COVERS = {
  Fiction: { src: duneCover, alt: "Cover of Dune" },
  Romance: { src: wutheringCover, alt: "Cover of Wuthering Heights" },
  Fantasy: { src: hobbitCover, alt: "Cover of The Hobbit" },
  Mystery: { src: orientCover, alt: "Cover of Murder on the Orient Express" },
  History: { src: sapiensCover, alt: "Cover of Sapiens" },
  Science: { src: timeCover, alt: "Cover of A Brief History of Time" },
  Philosophy: { src: meditationsCover, alt: "Cover of Meditations" },
  Business: { src: leanCover, alt: "Cover of The Lean Startup" },
  Technology: { src: waveCover, alt: "Cover of The Coming Wave" },
};

const MOVEMENTS = [
  {
    name: "Romanticism",
    period: "Late 18th – mid 19th century",
    text: "A reaction against rationalism that put emotion, nature and individual imagination at the center of art and writing.",
  },
  {
    name: "Realism",
    period: "Mid – late 19th century",
    text: "Fiction that aims to depict everyday life and ordinary people as they are, with close attention to society and detail.",
  },
  {
    name: "Surrealism",
    period: "Early 20th century",
    text: "Born in Paris, it explored dreams and the unconscious, favoring unexpected images and the logic of the irrational.",
  },
  {
    name: "Existentialism",
    period: "20th century",
    text: "A philosophical and literary current about freedom, choice and the search for meaning in a world without given answers.",
  },
];

function CategoryCard({ category, index }) {
  const cover = COVERS[category.name];
  const number = String(index + 1).padStart(2, "0");

  return (
    <Link
      to={`/discover?category=${encodeURIComponent(category.name)}`}
      aria-label={`Explore ${category.name}`}
      className="group flex h-full min-h-[11rem] gap-5 border border-line bg-white/40 p-5 transition-colors duration-300 hover:border-burgundy hover:bg-white/70 motion-reduce:transition-none md:p-6"
    >
      <div className="w-24 shrink-0 self-start overflow-hidden border border-line bg-secondary md:w-28">
        {cover ? (
          <img
            src={cover.src}
            alt={cover.alt}
            loading="lazy"
            className="block h-auto w-full transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        ) : (
          <div className="flex aspect-[2/3] w-full items-center justify-center text-gold-deep transition-colors duration-300 group-hover:text-burgundy motion-reduce:transition-none">
            <Icon icon={category.icon} className="h-8 w-8" />
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <span className="font-serif text-sm italic text-gold-deep">
          № {number}
        </span>
        <h3 className="mt-2 font-serif text-2xl text-burgundy">
          {category.name}
        </h3>
        <p className="mt-2 text-sm text-muted">{category.text}</p>
        <span className="mt-auto inline-flex items-center gap-2 pt-5 text-[11px] uppercase tracking-[0.3em] text-gold-deep transition-colors group-hover:text-burgundy">
          Explore
          <Icon
            icon="lucide:arrow-right"
            className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
          />
        </span>
      </div>
    </Link>
  );
}

export default function Categories() {
  usePageTitle("Literary Categories");
  const genresRef = useRef(null);

  const scrollToGenres = () => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    genresRef.current?.scrollIntoView({
      behavior: reduced ? "auto" : "smooth",
      block: "start",
    });
  };

  return (
    <>
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-16 md:grid-cols-[1.2fr_1fr] md:py-24">
        <div>
          <p className="text-[11px] uppercase tracking-[0.3em] text-gold-deep">
            The art of reading
          </p>
          <h1 className="mt-4 font-serif text-4xl leading-tight md:text-6xl">
            Every genre tells a <em className="text-burgundy">different</em>{" "}
            story.
          </h1>
          <p className="mt-6 max-w-xl text-base text-muted md:text-lg">
            From timeless classics to modern masterpieces, discover the worlds,
            ideas, and emotions that make literature unforgettable.
          </p>
          <button
            type="button"
            onClick={scrollToGenres}
            className="mt-8 inline-flex items-center gap-2 bg-burgundy px-7 py-3 text-xs uppercase tracking-[0.2em] text-cream transition-colors hover:bg-burgundy/90"
          >
            Browse genres
            <Icon icon="lucide:arrow-down" className="h-4 w-4" />
          </button>
        </div>

        <div
          aria-hidden="true"
          className="relative mx-auto hidden h-80 w-full max-w-sm md:block"
        >
          <img
            src={hobbitCover}
            alt=""
            className="absolute left-0 top-10 h-56 w-auto -rotate-6 border border-line shadow-md"
          />
          <img
            src={duneCover}
            alt=""
            className="absolute left-1/2 top-0 z-10 h-72 w-auto -translate-x-1/2 border border-line shadow-lg"
          />
          <img
            src={orientCover}
            alt=""
            className="absolute right-0 top-14 h-56 w-auto rotate-6 border border-line shadow-md"
          />
        </div>
      </section>

      <section
        ref={genresRef}
        aria-labelledby="genres-heading"
        className="mx-auto max-w-6xl scroll-mt-24 px-6 pb-16 md:pb-24"
      >
        <p className="text-[11px] uppercase tracking-[0.3em] text-gold-deep">
          The collection
        </p>
        <h2
          id="genres-heading"
          className="mt-3 font-serif text-3xl md:text-4xl"
        >
          Browse by <em className="text-burgundy">genre.</em>
        </h2>

        <div className="mt-10 grid auto-rows-fr gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
          {categories.map((category, index) => (
            <CategoryCard
              key={category.name}
              category={category}
              index={index}
            />
          ))}
        </div>
      </section>

      <section
        aria-labelledby="movements-heading"
        className="border-y border-line bg-secondary"
      >
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
          <p className="text-[11px] uppercase tracking-[0.3em] text-gold-deep">
            The history of ideas
          </p>
          <h2
            id="movements-heading"
            className="mt-3 font-serif text-3xl md:text-4xl"
          >
            Explore literary <em className="text-burgundy">movements.</em>
          </h2>
          <p className="mt-4 max-w-2xl text-muted">
            Movements describe how writers thought and wrote in a given era.
            They are different from genres, and this section is an introduction
            to read, not a filter.
          </p>

          <div className="mt-10 grid auto-rows-fr gap-px border border-line bg-line sm:grid-cols-2">
            {MOVEMENTS.map((movement) => (
              <article
                key={movement.name}
                className="flex h-full flex-col bg-cream p-6 md:p-8"
              >
                <p className="text-[11px] uppercase tracking-[0.3em] text-gold-deep">
                  {movement.period}
                </p>
                <h3 className="mt-3 font-serif text-2xl text-burgundy">
                  {movement.name}
                </h3>
                <p className="mt-3 text-sm text-muted">{movement.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 md:py-24">
        <div className="grid items-center gap-8 md:grid-cols-2 md:gap-12">
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-gold-deep">
              Looking for something specific
            </p>
            <h2 className="mt-3 font-serif text-3xl md:text-4xl">
              Find the stories that <em className="text-burgundy">speak</em> to
              you.
            </h2>
          </div>
          <div>
            <p className="text-muted">
              Know a title, an author or a subject? Search the whole library and
              refine by genre in Discover.
            </p>
            <Link
              to="/discover"
              className="mt-6 inline-flex items-center gap-2 border border-line px-7 py-3 text-xs uppercase tracking-[0.2em] transition-colors hover:border-burgundy hover:text-burgundy"
            >
              Search the library
              <Icon icon="lucide:arrow-right" className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-burgundy text-cream">
        <div className="mx-auto max-w-4xl px-6 py-16 text-center md:py-24">
          <h2 className="font-serif text-3xl md:text-5xl">
            A world of <em className="text-gold">stories</em> awaits.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-cream/80">
            Your next unforgettable read may be closer than you think.
          </p>
          <Link
            to="/discover"
            className="mt-8 inline-flex items-center gap-2 bg-cream px-8 py-3 text-xs uppercase tracking-[0.2em] text-burgundy transition-colors hover:bg-white"
          >
            Start discovering
            <Icon icon="lucide:arrow-right" className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
