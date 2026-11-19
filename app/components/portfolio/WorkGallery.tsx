"use client";

import Image from "next/image";
import type { GridWork } from "@/lib/portfolio-data";
import { workCoverClass } from "@/lib/portfolio-data";
import { useMorphModal } from "./useMorphModal";

type WorkGalleryProps = {
  works: GridWork[];
  categoryLabel: string;
};

/** 作品格狀列表：點卡片不換頁，卡片崩解後在原地重組成說明 modal */
export function WorkGallery({ works, categoryLabel }: WorkGalleryProps) {
  const { activeSlug, open, close, panelRef, closeRef } = useMorphModal();
  const active = works.find((w) => w.slug === activeSlug) ?? null;

  return (
    <>
      <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 xl:grid-cols-3">
        {works.map((work) => (
          <button
            key={work.slug}
            type="button"
            onClick={(e) => open(work.slug, e.currentTarget)}
            data-dissolving={activeSlug === work.slug ? "" : undefined}
            aria-haspopup="dialog"
            className="work-card group flex flex-col text-left"
          >
            <div
              className={`work-media aspect-[16/10] w-full overflow-hidden ${workCoverClass(work.accent)}`}
            >
              {work.coverImageUrl ? (
                <Image
                  src={work.coverImageUrl}
                  alt={work.title}
                  fill
                  className="object-cover grayscale transition duration-500 ease-out group-hover:grayscale-0 motion-reduce:transition-none"
                  sizes="(max-width: 640px) 100vw, 33vw"
                />
              ) : null}
            </div>
            <div className="mt-3 flex items-baseline justify-between gap-4">
              <h2 className="line-clamp-2 text-base text-paper">{work.title}</h2>
              <span className="shrink-0 text-xs text-mute tabular-nums">{work.year}</span>
            </div>
            {work.subtitle && (
              <p className="mt-0.5 line-clamp-2 text-sm text-mute">{work.subtitle}</p>
            )}
            <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-paper/75">
              {work.summary}
            </p>
          </button>
        ))}
      </div>

      {active ? (
        <div
          className="modal-backdrop-late fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/85 p-3 sm:items-center sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label={active.title}
          onClick={close}
        >
          <div
            ref={panelRef}
            className="modal-panel-late max-h-[92vh] w-full max-w-3xl overflow-y-auto border border-line bg-ink p-5 sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="flex gap-3 text-xs text-mute">
                  <span>{categoryLabel}</span>
                  <span>{active.year}</span>
                </p>
                <h2 className="mt-1 font-serif text-2xl break-words text-paper sm:text-3xl">
                  {active.title}
                </h2>
                {active.subtitle ? (
                  <p className="mt-1 text-sm break-words text-mute">{active.subtitle}</p>
                ) : null}
              </div>
              <button
                ref={closeRef}
                type="button"
                onClick={close}
                className="shrink-0 text-sm text-mute transition-colors hover:text-paper"
              >
                關閉
              </button>
            </div>

            {active.coverImageUrl ? (
              <div
                className={`relative mt-6 aspect-[16/10] w-full overflow-hidden ${workCoverClass(active.accent)}`}
              >
                <Image
                  src={active.coverImageUrl}
                  alt={active.title}
                  fill
                  className="object-cover object-top"
                  sizes="(max-width: 768px) 100vw, 48rem"
                />
              </div>
            ) : null}

            <div className="mt-6 max-w-[38em] space-y-4 text-[15px] leading-[1.9] break-words text-paper/85">
              <p className="text-paper">{active.summary}</p>
              {active.body.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
              {active.externalUrl ? (
                <p>
                  <a
                    href={active.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-paper underline decoration-line underline-offset-4 transition-colors hover:decoration-paper"
                  >
                    前往作品連結
                  </a>
                </p>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
