import Image from "next/image";
import Link from "next/link";
import type { GridWork } from "@/lib/portfolio-data";
import { workCoverClass } from "@/lib/portfolio-data";

type WorkBentoCardProps = {
  work: GridWork;
  href: string;
  className?: string;
};

export function WorkBentoCard({ work, href, className = "" }: WorkBentoCardProps) {
  const linkHref = work.externalUrl ?? href;
  const isExternal = Boolean(work.externalUrl);

  return (
    <Link
      href={linkHref}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      className={`group flex flex-col ${className}`}
    >
      <div
        className={`relative aspect-[16/10] w-full overflow-hidden ${workCoverClass(work.accent)}`}
      >
        {work.coverImageUrl ? (
          <Image
            src={work.coverImageUrl}
            alt={work.title}
            fill
            className="object-cover grayscale transition duration-500 ease-out group-hover:grayscale-0 motion-reduce:transition-none"
            sizes="(max-width: 640px) 100vw, 50vw"
          />
        ) : null}
      </div>
      <div className="mt-3 flex items-baseline justify-between gap-4">
        <h2 className="line-clamp-2 text-base text-paper underline-offset-4 group-hover:underline">
          {work.title}
        </h2>
        <span className="shrink-0 text-xs text-mute tabular-nums">{work.year}</span>
      </div>
      {work.subtitle && (
        <p className="mt-0.5 line-clamp-2 text-sm text-mute">{work.subtitle}</p>
      )}
      <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-paper/75">
        {work.summary}
      </p>
      {isExternal ? (
        <span className="mt-2 text-xs text-mute">外部連結</span>
      ) : null}
    </Link>
  );
}
