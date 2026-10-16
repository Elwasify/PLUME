import { Link } from "react-router-dom";
import { Icon } from "@iconify/react";
import { getArticleDate, getArticleReadingMinutes } from "../../data/journalArticles";

export default function JournalCard({ article }) {
  return (
    <article className="group flex h-full flex-col border border-line bg-white/50">
      <Link
        to={`/journal/${article.id}`}
        aria-label={`Read ${article.title}`}
        className="block aspect-[5/4] overflow-hidden bg-secondary"
      >
        <img
          src={article.cover}
          alt={`Illustration for ${article.title}`}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
      </Link>

      <div className="flex flex-1 flex-col p-5 md:p-6">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] uppercase tracking-[0.2em] text-gold-deep">
          <span>{article.category}</span>
          <span aria-hidden="true">·</span>
          <time dateTime={article.publishedAt}>{getArticleDate(article)}</time>
        </div>
        <h3 className="mt-3 font-serif text-2xl leading-tight text-burgundy">
          <Link to={`/journal/${article.id}`} className="hover:underline">
            {article.title}
          </Link>
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          {article.excerpt}
        </p>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-5 text-xs text-ink/70">
          <span>{article.author}</span>
          <span className="inline-flex items-center gap-1.5">
            <Icon icon="lucide:clock-3" className="h-3.5 w-3.5" />
            {getArticleReadingMinutes(article)} min read
          </span>
        </div>
      </div>
    </article>
  );
}
