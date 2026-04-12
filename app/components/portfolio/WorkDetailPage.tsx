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
    <main className="min-h-full bg-zinc-100 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <Link
          href={listHref}
          className="text-sm text-violet-600 hover:underline dark:text-violet-400"
        >
          ← 返回{categoryLabel}
        </Link>
        <article className="mt-8 overflow-hidden rounded-2xl border border-zinc-200/80 bg-white/80 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-950/70">
          <div
            className={`relative h-48 w-full overflow-hidden sm:h-56 ${workCoverClass(work.accent)}`}
          >
            {work.coverImageUrl ? (
              <Image
                src={work.coverImageUrl}
                alt={work.title}
                fill
                className="object-cover object-top"
                sizes="(max-width: 768px) 100vw, 48rem"
                priority
              />
            ) : null}
          </div>
          <div className="space-y-4 p-6 sm:p-8">
            <p className="text-xs font-medium uppercase tracking-widest text-zinc-500">
              {categoryLabel} · {work.year}
            </p>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              {work.title}
            </h1>
            {work.subtitle && (
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {work.subtitle}
              </p>
            )}
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {work.summary}
            </p>
            <div className="space-y-3 border-t border-zinc-200 pt-6 text-sm leading-relaxed text-zinc-600 dark:border-zinc-800 dark:text-zinc-300">
              {work.body.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </div>
        </article>
      </div>
    </main>
  );
}
