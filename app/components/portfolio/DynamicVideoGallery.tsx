"use client";

import { useEffect, useMemo, useState } from "react";
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

  const activeWork = useMemo(
    () => works.find((work) => work.slug === activeSlug) ?? null,
    [works, activeSlug],
  );

  useEffect(() => {
    if (!activeWork) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActiveSlug(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeWork]);

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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {works.map((work) => (
          <button
            key={work.slug}
            type="button"
            onClick={() => setActiveSlug(work.slug)}
            className="group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-200/80 bg-white/70 p-0 text-left shadow-sm outline-none backdrop-blur-sm transition duration-300 ease-out hover:-translate-y-1 hover:border-violet-400/40 hover:shadow-xl hover:shadow-violet-500/10 focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-100 dark:border-zinc-800/80 dark:bg-zinc-950/60 dark:hover:border-violet-500/35 dark:hover:shadow-violet-500/15 dark:focus-visible:ring-offset-zinc-950"
          >
            <div
              className={`relative aspect-[16/10] w-full overflow-hidden transition duration-500 group-hover:scale-[1.03] ${workCoverClass(work.accent)}`}
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.35),transparent_55%)] opacity-70 transition duration-500 group-hover:opacity-100 dark:bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.12),transparent_55%)]" />
              <span className="absolute bottom-3 left-3 z-10 rounded-full bg-black/45 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-white backdrop-blur-sm">
                {work.year}
              </span>
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-2 p-5">
              <h2 className="line-clamp-2 text-base font-semibold tracking-tight text-zinc-900 transition group-hover:text-violet-700 dark:text-zinc-50 dark:group-hover:text-violet-300">
                {work.title}
              </h2>
              {work.subtitle ? (
                <p className="line-clamp-2 text-xs text-zinc-500 dark:text-zinc-400">{work.subtitle}</p>
              ) : null}
              <p className="line-clamp-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                {work.summary}
              </p>
              <span className="mt-auto inline-flex items-center gap-1 text-xs font-medium text-violet-600 opacity-0 transition duration-300 group-hover:translate-x-0.5 group-hover:opacity-100 dark:text-violet-400">
                查看詳情
                <span aria-hidden>→</span>
              </span>
            </div>
          </button>
        ))}
      </div>

      {activeWork ? (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/65 p-3 sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-label={activeWork.title}
          onClick={() => setActiveSlug(null)}
        >
          <div
            className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950 sm:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-widest text-zinc-500">
                  動態影像 · {activeWork.year}
                </p>
                <h2 className="mt-1 break-words text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                  {activeWork.title}
                </h2>
                {activeWork.subtitle ? (
                  <p className="mt-1 break-words text-sm text-zinc-500 dark:text-zinc-400">
                    {activeWork.subtitle}
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => setActiveSlug(null)}
                className="rounded-full border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                關閉
              </button>
            </div>

            <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
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
                <div className="flex aspect-video w-full items-center justify-center bg-zinc-100 text-sm text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
                  此作品尚未提供影片
                </div>
              )}
            </div>

            <div className="mt-5 space-y-3 break-words text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
              <p className="font-medium">{activeWork.summary}</p>
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
