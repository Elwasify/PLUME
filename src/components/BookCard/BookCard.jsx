export default function BookCard({ book }) {
  const info = book.volumeInfo || {};
  const cover = info.imageLinks?.thumbnail?.replace("http://", "https://");
  const author = info.authors?.join(", ") || "Unknown author";

  return (
    <article className="group">
      <div className="aspect-[2/3] overflow-hidden border border-gold/40 bg-white/50">
        {cover ? (
          <img
            src={cover}
            alt={`Cover of ${info.title}`}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center p-4 text-center font-serif text-burgundy">
            {info.title}
          </div>
        )}
      </div>
      <h3 className="mt-3 line-clamp-2 font-serif text-lg text-burgundy">
        {info.title}
      </h3>
      <p className="text-sm text-ink/70">{author}</p>
    </article>
  );
}
