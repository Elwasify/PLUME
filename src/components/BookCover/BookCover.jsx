import { useState } from "react";
import { Icon } from "@iconify/react";

export default function BookCover({
  src,
  alt,
  title,
  author,
  className = "",
}) {
  const [failedSrc, setFailedSrc] = useState("");
  const failed = src === failedSrc;

  if (src && !failed) {
    return (
      <img
        src={src}
        alt={alt}
        onError={() => setFailedSrc(src)}
        className={className}
      />
    );
  }

  return (
    <div
      role="img"
      aria-label={alt}
      className={`flex aspect-[2/3] items-center justify-center bg-cream p-3 text-center ${className}`}
    >
      <div className="flex h-full w-full flex-col items-center justify-between border border-gold/60 px-3 py-6">
        <Icon icon="lucide:book-open" className="h-7 w-7 text-gold-deep" />
        <span className="line-clamp-5 font-serif text-base leading-snug text-burgundy">
          {title}
        </span>
        {author ? (
          <span className="line-clamp-2 text-[10px] uppercase tracking-[0.2em] text-gold-deep">
            {author}
          </span>
        ) : (
          <span />
        )}
      </div>
    </div>
  );
}