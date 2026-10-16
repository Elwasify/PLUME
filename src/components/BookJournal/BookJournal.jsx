import { Icon } from "@iconify/react";
import {
  getArticleDate,
  getArticleReadingMinutes,
} from "../../data/journalArticles";

export default function BookJournal({ articles }) {
  if (!articles.length) return null;

  return (
    <section
      aria-labelledby="book-journal-heading"
      className="mt-16 border-t border-line pt-12 md:mt-24"
    >
      <p className="text-[11px] uppercase tracking-[0.3em] text-gold-deep">
        Le Journal
      </p>
      <h2 id="book-journal-heading" className="mt-3 text-3xl md:text-4xl">
        Stories around <em className="text-burgundy">this book</em>
      </h2>
      <div className="mt-8 space-y-4">
        {articles.map((article) => (
          <article key={article.id} className="border border-line bg-white/50">
            <details className="group">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-5 p-5 marker:hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-burgundy md:p-7">
                <span>
                  <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] uppercase tracking-[0.2em] text-gold-deep">
                    <span>{article.category}</span>
                    <span aria-hidden="true">·</span>
                    <time dateTime={article.publishedAt}>
                      {getArticleDate(article)}
                    </time>
                    <span aria-hidden="true">·</span>
                    <span>{getArticleReadingMinutes(article)} min read</span>
                  </span>
                  <span className="mt-3 block font-serif text-2xl leading-tight text-burgundy md:text-3xl">
                    {article.title}
                  </span>
                  <span className="mt-2 block max-w-3xl text-sm leading-relaxed text-muted">
                    {article.excerpt}
                  </span>
                  <span className="mt-3 block text-xs text-ink/70">
                    {article.author}
                  </span>
                  <span className="mt-4 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-burgundy">
                    Read the essay on this page
                  </span>
                </span>
                <Icon
                  icon="lucide:chevron-down"
                  aria-hidden="true"
                  className="mt-1 h-5 w-5 shrink-0 text-burgundy transition-transform group-open:rotate-180 motion-reduce:transition-none"
                />
              </summary>
              <div className="space-y-8 border-t border-line px-5 py-7 md:px-10 md:py-9">
                <p className="max-w-3xl font-serif text-lg italic leading-relaxed text-muted">
                  {article.subtitle}
                </p>
                {article.sections.map((section) => (
                  <section key={section.id} className="max-w-3xl">
                    <h3 className="font-serif text-xl leading-tight text-burgundy md:text-2xl">
                      {section.title}
                    </h3>
                    <div className="mt-3 space-y-4 text-sm leading-7 text-ink/80 md:text-base md:leading-8">
                      {section.paragraphs.map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            </details>
          </article>
        ))}
      </div>
    </section>
  );
}
