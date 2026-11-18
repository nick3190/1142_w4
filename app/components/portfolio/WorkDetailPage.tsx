import Image from "next/image";
import Link from "next/link";
import type { GridWork } from "@/lib/portfolio-data";
import { workCoverClass } from "@/lib/portfolio-data";

type WorkDetailPageProps = {
  work: GridWork;
  categoryLabel: string;
  listHref: string;
};

export function WorkDetailPage({
  work,
  categoryLabel,
  listHref,
}: WorkDetailPageProps) {
  return (
    <main className="min-h-full bg-ink text-paper">
      <div className="mx-auto max-w-3xl px-5 py-10 sm:px-8 lg:py-16">
        <Link
          href={listHref}
          className="text-sm text-mute transition-colors hover:text-paper"
        >
          返回{categoryLabel}
        </Link>
        <article className="mt-8">
          <p className="flex gap-3 text-xs text-mute">
            <span>{categoryLabel}</span>
            <span>{work.year}</span>
          </p>
          <h1 className="mt-2 font-serif text-3xl leading-tight break-words sm:text-4xl">
            {work.title}
          </h1>
          {work.subtitle && (
            <p className="mt-2 text-base break-words text-mute">{work.subtitle}</p>
          )}
          {work.coverImageUrl ? (
            <div
              className={`relative mt-8 aspect-[16/10] w-full overflow-hidden ${workCoverClass(work.accent)}`}
            >
              <Image
                src={work.coverImageUrl}
                alt={work.title}
                fill
                className="object-cover object-top"
                sizes="(max-width: 768px) 100vw, 48rem"
                priority
              />
            </div>
          ) : null}
          <div className="mt-8 max-w-[38em] space-y-4 text-[15px] leading-[1.9] break-words text-paper/85">
            <p className="text-paper">{work.summary}</p>
            {work.body.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
            {work.externalUrl ? (
              <p>
                <a
                  href={work.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-paper underline decoration-line underline-offset-4 transition-colors hover:decoration-paper"
                >
                  前往作品連結
                </a>
              </p>
            ) : null}
          </div>
        </article>
      </div>
    </main>
  );
}
