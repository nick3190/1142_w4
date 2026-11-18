"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { emitFromRect } from "@/lib/particle-fx";
import type { GridWork } from "@/lib/portfolio-data";
import { workCoverClass } from "@/lib/portfolio-data";

type DynamicVideoGalleryProps = {
  works: GridWork[];
};

function toYoutubeEmbed(url: string): string | null {
  try {
    const u = new URL(url);
    let id = u.searchParams.get("v");
    if (u.hostname === "youtu.be") {
      id = u.pathname.replace(/^\//, "").split(/[/?#]/)[0] ?? null;
    }
    if (!id && u.hostname.includes("youtube.com")) {
      const m = u.pathname.match(/\/embed\/([^/?]+)/);
      if (m) id = m[1] ?? null;
    }
    if (!id) return null;
    return `https://www.youtube.com/embed/${id}?rel=0`;
  } catch {
    return null;
  }
}

function isLocalVideo(url: string): boolean {
  return /\.(mp4|mov|webm|m4v|ogv)(\?.*)?$/i.test(url);
}

export function DynamicVideoGallery({ works }: DynamicVideoGalleryProps) {
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  // 關閉：先從面板位置炸開粒子，再移除面板
  const close = useCallback(() => {
    const el = panelRef.current;
    if (el) emitFromRect(el.getBoundingClientRect(), "scatter");
    setActiveSlug(null);
  }, []);

  const activeWork = useMemo(
    () => works.find((work) => work.slug === activeSlug) ?? null,
    [works, activeSlug],
  );

  useEffect(() => {
    if (!activeWork) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeWork, close]);

  // 打開：粒子從四周聚攏到面板輪廓
  useEffect(() => {
    if (!activeSlug) return;
    const id = requestAnimationFrame(() => {
      const el = panelRef.current;
      if (el) emitFromRect(el.getBoundingClientRect(), "gather");
    });
    return () => cancelAnimationFrame(id);
  }, [activeSlug]);

  useEffect(() => {
    if (!activeWork) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [activeWork]);

  const mediaUrl = activeWork?.externalUrl ?? "";
  const youtubeEmbed = mediaUrl ? toYoutubeEmbed(mediaUrl) : null;
  const isVideo = mediaUrl ? isLocalVideo(mediaUrl) : false;

  return (
    <>
      <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 xl:grid-cols-3">
        {works.map((work) => (
          <button
            key={work.slug}
            type="button"
            onClick={() => setActiveSlug(work.slug)}
            className="group flex flex-col text-left"
          >
            <div
              className={`relative aspect-[16/10] w-full overflow-hidden ${workCoverClass(work.accent)}`}
            >
              <span className="absolute inset-0 flex items-center justify-center" aria-hidden>
                <span className="flex h-12 w-12 items-center justify-center rounded-full border border-paper/60 text-paper transition-colors group-hover:bg-paper group-hover:text-ink">
                  <svg width="12" height="12" viewBox="0 0 12 12">
                    <path d="M3 1 L11 6 L3 11 Z" fill="currentColor" />
                  </svg>
                </span>
              </span>
            </div>
            <div className="mt-3 flex items-baseline justify-between gap-4">
              <h2 className="line-clamp-2 text-base text-paper underline-offset-4 group-hover:underline">
                {work.title}
              </h2>
              <span className="shrink-0 text-xs text-mute tabular-nums">{work.year}</span>
            </div>
            {work.subtitle ? (
              <p className="mt-0.5 line-clamp-2 text-sm text-mute">{work.subtitle}</p>
            ) : null}
            <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-paper/75">
              {work.summary}
            </p>
          </button>
        ))}
      </div>

      {activeWork ? (
        <div
          className="modal-backdrop fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/85 p-3 sm:items-center sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label={activeWork.title}
          onClick={close}
        >
          <div
            ref={panelRef}
            className="modal-panel max-h-[92vh] w-full max-w-4xl overflow-y-auto border border-line bg-ink p-5 sm:p-8"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="flex gap-3 text-xs text-mute">
                  <span>動態影像</span>
                  <span>{activeWork.year}</span>
                </p>
                <h2 className="mt-1 font-serif text-2xl break-words text-paper">
                  {activeWork.title}
                </h2>
                {activeWork.subtitle ? (
                  <p className="mt-1 text-sm break-words text-mute">
                    {activeWork.subtitle}
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={close}
                className="text-sm text-mute transition-colors hover:text-paper"
              >
                關閉
              </button>
            </div>

            <div className="overflow-hidden">
              {youtubeEmbed ? (
                <div className="aspect-video w-full bg-black">
                  <iframe
                    src={youtubeEmbed}
                    title={activeWork.title}
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
              ) : isVideo ? (
                <video src={mediaUrl} controls className="aspect-video w-full bg-black" />
              ) : (
                <div className="flex aspect-video w-full items-center justify-center bg-faint text-sm text-mute">
                  此作品尚未提供影片
                </div>
              )}
            </div>

            <div className="mt-6 max-w-[38em] space-y-3 text-[15px] leading-[1.9] break-words text-paper/85">
              <p className="text-paper">{activeWork.summary}</p>
              {activeWork.body.map((paragraph, index) => (
                <p key={`${activeWork.slug}-body-${index}`}>{paragraph}</p>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
