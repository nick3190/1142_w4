import Link from "next/link";
import type { GridWork } from "@/lib/portfolio-data";
import { workCoverClass } from "@/lib/portfolio-data";

type WorkBentoCardProps = {
  work: GridWork;
  href: string;
  className?: string;
};

export function WorkBentoCard({ work, href, className = "" }: WorkBentoCardProps) {
  return (
    <Link
      href={href}
      className={`group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-200/80 bg-white/70 p-0 shadow-sm outline-none backdrop-blur-sm transition duration-300 ease-out hover:-translate-y-1 hover:border-violet-400/40 hover:shadow-xl hover:shadow-violet-500/10 focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-100 dark:border-zinc-800/80 dark:bg-zinc-950/60 dark:hover:border-violet-500/35 dark:hover:shadow-violet-500/15 dark:focus-visible:ring-offset-zinc-950 ${className}`}
    >
      <div
        className={`relative aspect-[16/10] w-full overflow-hidden transition duration-500 group-hover:scale-[1.03] ${workCoverClass(work.accent)}`}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.35),transparent_55%)] opacity-70 transition duration-500 group-hover:opacity-100 dark:bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.12),transparent_55%)]" />
        <span className="absolute bottom-3 left-3 rounded-full bg-black/45 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-white backdrop-blur-sm">
          {work.year}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-zinc-900 transition group-hover:text-violet-700 dark:text-zinc-50 dark:group-hover:text-violet-300">
            {work.title}
          </h2>
          {work.subtitle && (
            <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
              {work.subtitle}
            </p>
          )}
        </div>
        <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
          {work.summary}
        </p>
        <span className="mt-auto inline-flex items-center gap-1 text-xs font-medium text-violet-600 opacity-0 transition duration-300 group-hover:translate-x-0.5 group-hover:opacity-100 dark:text-violet-400">
          作品介紹
          <span aria-hidden>→</span>
        </span>
      </div>
    </Link>
  );
}
