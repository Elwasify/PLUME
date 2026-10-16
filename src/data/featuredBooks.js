import prideImage from "../assets/authors/pride-prejudice.jpg";
import strangerImage from "../assets/authors/the-stranger.jpg";
import nightsImage from "../assets/authors/white-nights.jpg";
import metamorphosisImage from "../assets/authors/metamorphosis.jpg";
import lesMiserablesImage from "../assets/authors/les-miserables.jpg";

export const featuredBooks = [
  {
    id: "OL66554W",
    image: prideImage,
    title: "Pride and Prejudice",
    author: "Jane Austen",
    year: "1813",
    bio: "1775 — 1817 · Hampshire",
    quote: "I declare after all there is no enjoyment like reading!",
  },
  {
    id: "OL1230613W",
    image: strangerImage,
    title: "The Stranger",
    author: "Albert Camus",
    year: "1942",
    bio: "1913 — 1960 · Mondovi",
    quote: "Mother died today.",
  },
  {
    id: "OL166952W",
    image: nightsImage,
    title: "White Nights",
    author: "Fyodor Dostoevsky",
    year: "1848",
    bio: "1821 — 1881 · Moscow",
    quote: "A whole minute of happiness! Is that too little for a man’s life?",
  },
  {
    id: "OL498556W",
    image: metamorphosisImage,
    title: "The Metamorphosis",
    author: "Franz Kafka",
    year: "1915",
    bio: "1883 — 1924 · Prague",
    quote: "He found himself transformed in his bed into a horrible vermin.",
  },
  {
    id: "OL1063588W",
    image: lesMiserablesImage,
    title: "Les Misérables",
    author: "Victor Hugo",
    year: "1862",
    bio: "1802 — 1885 · Besançon",
    quote: "Hope is the word which God has written on the brow of every man.",
  },
].map((book) => ({
  ...book,
  catalogBook: {
    id: book.id,
    volumeInfo: {
      title: book.title,
      authors: [book.author],
      imageLinks: { thumbnail: book.image },
    },
  },
}));

export const featuredBooksById = new Map(
  featuredBooks.map((book) => [book.id, book]),
);
