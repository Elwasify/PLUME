import { useState } from "react";
import { Link } from "react-router-dom";
import { Icon } from "@iconify/react";
import kafka from "../../assets/authors/Kafka.jpg";
import usePageTitle from "../../hooks/usePageTitle";

const pillars = [
  {
    n: "I",
    title: "Literature",
    text: "Words are the oldest technology for sharing a mind. We treat every title as a doorway, not a product.",
  },
  {
    n: "II",
    title: "Imagination",
    text: "Browsing should feel like wandering — following a cover, a name, a subject, wherever it leads.",
  },
  {
    n: "III",
    title: "Discovery",
    text: "From forgotten classics to new voices, the catalogue is live and endless. Your next favourite is a search away.",
  },
];

function Portrait() {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="flex aspect-[4/5] w-full flex-col items-center justify-center bg-burgundy text-cream">
        <Icon icon="lucide:feather" className="h-10 w-10 text-gold" />
        <p className="mt-6 font-serif text-7xl italic">K.</p>
      </div>
    );
  }

  return (
    <img
      src={kafka}
      alt="Portrait of Franz Kafka, 1923"
      onError={() => setFailed(true)}
      className="aspect-[4/5] w-full object-cover object-top grayscale"
    />
  );
}

export default function About() {
  usePageTitle("About");

  return (
    <div>
      <section className="mx-auto max-w-5xl px-5 py-20 text-center md:py-28">
        <p className="text-[11px] uppercase tracking-[0.3em] text-gold-deep">
          À propos
        </p>
        <h1 className="mt-6 text-5xl leading-tight md:text-7xl">
          A feather, <em className="text-burgundy">a word,</em> a world.
        </h1>
        <p className="mx-auto mt-10 max-w-2xl font-serif text-xl leading-relaxed text-muted">
          <em>Plume</em> is the French word for feather — the quill that wrote
          the first novels, letters and manifestos. PLUME is a conceptual
          bookstore that borrows that spirit: an elegant, unhurried place to
          find what to read next.
        </p>
      </section>

      <section className="border-y border-line bg-secondary/40">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 md:grid-cols-[360px_1fr]">
          <figure className="mx-auto w-full max-w-sm">
            <div className="overflow-hidden border border-gold/40 bg-white p-3 shadow-xl">
              <Portrait />
            </div>
            <figcaption className="mt-4 text-center text-xs uppercase tracking-[0.3em] text-gold-deep">
              Franz Kafka · 1883 – 1924
            </figcaption>
          </figure>

          <div>
            <Icon icon="lucide:quote" className="h-10 w-10 text-gold" />
            <blockquote className="mt-6 font-serif text-3xl italic leading-snug md:text-5xl">
              A book must be the axe for the frozen sea within us.
            </blockquote>
            <p className="mt-6 text-sm uppercase tracking-[0.25em] text-burgundy">
              — Franz Kafka, letter to Oskar Pollak, 1904
            </p>
            <Link
              to="/discover?q=franz kafka"
              className="mt-10 inline-block text-xs uppercase tracking-[0.2em] text-burgundy underline decoration-gold underline-offset-8"
            >
              Read Kafka
            </Link>
          </div>
        </div>
      </section>

      <section className="border-b border-line">
        <div className="mx-auto grid max-w-7xl md:grid-cols-3">
          {pillars.map((p) => (
            <div
              key={p.n}
              className="border-line p-10 md:border-r md:last:border-r-0"
            >
              <p className="font-serif text-5xl italic text-gold">{p.n}</p>
              <h2 className="mt-6 text-3xl">{p.title}</h2>
              <p className="mt-4 leading-relaxed text-muted">{p.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 py-24 text-center">
        <Icon icon="lucide:feather" className="mx-auto h-8 w-8 text-gold" />
        <blockquote className="mt-6 font-serif text-3xl italic leading-snug md:text-4xl">
          “Every Story Begins with a Word.”
        </blockquote>
        <p className="mt-6 text-sm text-muted">
          PLUME is a portfolio project. Book data comes from Open Library; there
          is no physical store and no real orders are processed.
        </p>
        <Link
          to="/discover"
          className="mt-10 inline-flex items-center justify-center bg-burgundy px-7 py-3.5 text-xs uppercase tracking-[0.2em] text-cream transition hover:bg-burgundy/90"
        >
          Begin discovering
        </Link>
      </section>
    </div>
  );
}
