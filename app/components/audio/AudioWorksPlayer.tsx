"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { AudioClip, AudioTrack } from "@/lib/portfolio-data";

function isVideoUrl(u: string) {
  return /\.(mov|mp4|webm|m4v|ogv)(\?.*)?$/i.test(u);
}

function youtubeEmbedSrc(watchUrl: string): string {
  try {
    const u = new URL(watchUrl.trim());
    let id: string | null = u.searchParams.get("v");
    const list = u.searchParams.get("list");
    if (u.hostname === "youtu.be") {
      id = u.pathname.replace(/^\//, "").split(/[/?#]/)[0] ?? null;
    }
    if (!id && u.hostname.includes("youtube.com")) {
      const m = u.pathname.match(/\/embed\/([^/?]+)/);
      if (m) id = m[1] ?? null;
    }
    if (!id) return watchUrl;
    let embed = `https://www.youtube.com/embed/${id}?rel=0`;
    if (list) embed += `&list=${encodeURIComponent(list)}`;
    return embed;
  } catch {
    return watchUrl;
  }
}

type DeckMode = "youtube" | "video" | "cover-audio" | "audio" | "none";

function deckMode(clip: AudioClip): DeckMode {
  if (clip.youtubeUrl) return "youtube";
  if (!clip.url) return "none";
  if (isVideoUrl(clip.url)) return "video";
  if (clip.coverImageUrl) return "cover-audio";
  return "audio";
}

type QueueEntry = {
  work: AudioTrack;
  clip: AudioClip;
};

function buildQueue(tracks: AudioTrack[]): QueueEntry[] {
  const out: QueueEntry[] = [];
  const score = tracks.filter((t) => t.kind === "配樂");
  const sound = tracks.filter((t) => t.kind === "聲音設計");
  const ordered = [...score, ...sound];
  for (const work of ordered) {
    if (work.clips?.length) {
      for (const clip of work.clips) {
        out.push({ work, clip });
      }
    } else {
      out.push({
        work,
        clip: { label: `${work.title}（尚無音檔）` },
      });
    }
  }
  return out;
}

type AudioWorksPlayerProps = {
  tracks: AudioTrack[];
  initialSlug?: string;
  initialAutoplay?: boolean;
};

export function AudioWorksPlayer({
  tracks,
  initialSlug,
  initialAutoplay = false,
}: AudioWorksPlayerProps) {
  const queue = useMemo(() => buildQueue(tracks), [tracks]);

  const initialFlat = useMemo(() => {
    if (!initialSlug) return 0;
    const i = queue.findIndex((e) => e.work.slug === initialSlug);
    return i >= 0 ? i : 0;
  }, [queue, initialSlug]);

  const [flatIndex, setFlatIndex] = useState(initialFlat);
  const current = queue[flatIndex] ?? queue[0];

  const initialOpenSlug = queue[initialFlat]?.work.slug ?? "";
  const [openSlugs, setOpenSlugs] = useState<Record<string, boolean>>(() => {
    const next: Record<string, boolean> = {};
    for (const t of tracks) {
      if (t.kind === "配樂") next[t.slug] = false;
    }
    if (initialOpenSlug && tracks.find((t) => t.slug === initialOpenSlug)?.kind === "配樂") {
      next[initialOpenSlug] = true;
    }
    return next;
  });

  const [autoplayTick, setAutoplayTick] = useState(0);
  const urlAutoplayBump = useRef(false);

  useEffect(() => {
    if (!initialAutoplay || urlAutoplayBump.current) return;
    urlAutoplayBump.current = true;
    setAutoplayTick((n) => n + 1);
  }, [initialAutoplay]);

  const goFlat = useCallback(
    (i: number) => {
      if (queue.length === 0) return;
      setFlatIndex(Math.max(0, Math.min(queue.length - 1, i)));
    },
    [queue.length],
  );

  const pickAndPlay = useCallback(
    (i: number) => {
      goFlat(i);
      setAutoplayTick((n) => n + 1);
    },
    [goFlat],
  );

  useEffect(() => {
    const slug = queue[flatIndex]?.work.slug;
    if (!slug) return;
    const kind = tracks.find((t) => t.slug === slug)?.kind;
    if (kind !== "配樂") return;
    setOpenSlugs((prev) => (prev[slug] ? prev : { ...prev, [slug]: true }));
  }, [flatIndex, queue, tracks]);

  const toggleWorkOpen = useCallback((slug: string) => {
    setOpenSlugs((prev) => ({ ...prev, [slug]: !prev[slug] }));
  }, []);

  const firstQueueIndexForWork = useCallback(
    (slug: string) => {
      const work = tracks.find((w) => w.slug === slug);
      if (!work) return -1;
      const clips =
        work.clips && work.clips.length > 0
          ? work.clips
          : [{ label: `${work.title}（尚無音檔）` }];
      const first = clips[0];
      return queue.findIndex(
        (q) => q.work.slug === slug && q.clip.label === first.label,
      );
    },
    [queue, tracks],
  );

  const playWorkFirst = useCallback(
    (slug: string) => {
      const qi = firstQueueIndexForWork(slug);
      if (qi < 0) return;
      const kind = tracks.find((t) => t.slug === slug)?.kind;
      if (kind === "配樂") {
        setOpenSlugs((prev) => ({ ...prev, [slug]: true }));
      }
      pickAndPlay(qi);
    },
    [firstQueueIndexForWork, pickAndPlay, tracks],
  );

  const score = useMemo(() => tracks.filter((t) => t.kind === "配樂"), [tracks]);
  const sound = useMemo(() => tracks.filter((t) => t.kind === "聲音設計"), [tracks]);

  return (
    <div className="grid h-full min-h-0 w-full grid-rows-[minmax(0,26vh)_auto_minmax(0,24vh)] gap-2 sm:gap-3 lg:grid-cols-[minmax(0,200px)_minmax(0,1fr)_minmax(0,150px)] lg:grid-rows-1 lg:items-stretch xl:grid-cols-[minmax(0,220px)_minmax(0,1fr)_minmax(0,170px)]">
      <aside className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-zinc-200/90 bg-white/95 shadow-md dark:border-zinc-800 dark:bg-zinc-900/95">
        <div className="shrink-0 border-b border-zinc-200 px-3 py-2 dark:border-zinc-800">
          <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-zinc-500">
            Queue
          </p>
          <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
            播放清單
          </p>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <PlaylistGroup
            label="配樂"
            works={score}
            queue={queue}
            flatIndex={flatIndex}
            expandable
            openSlugs={openSlugs}
            onToggleWork={toggleWorkOpen}
            onPlayWorkFirst={playWorkFirst}
            onPickClip={pickAndPlay}
          />
          <PlaylistGroup
            label="聲音設計"
            works={sound}
            queue={queue}
            flatIndex={flatIndex}
            expandable={false}
            openSlugs={openSlugs}
            onToggleWork={toggleWorkOpen}
            onPlayWorkFirst={playWorkFirst}
            onPickClip={pickAndPlay}
          />
        </div>
      </aside>

      <div className="flex min-h-0 min-w-0 items-center justify-center py-1 lg:py-0">
        <PlaybackDeck
          key={`${current.work.slug}-${current.clip.label}-${current.clip.url ?? ""}-${current.clip.youtubeUrl ?? ""}`}
          entry={current}
          flatIndex={flatIndex}
          queueLength={queue.length}
          autoplayTick={autoplayTick}
          onPrev={() => goFlat(flatIndex - 1)}
          onNext={() => goFlat(flatIndex + 1)}
        />
      </div>

      <aside className="min-h-0 min-w-0 overflow-y-auto overscroll-contain rounded-2xl border border-zinc-200/90 bg-white/95 p-3 shadow-md dark:border-zinc-800 dark:bg-zinc-900/95 sm:p-3.5">
        <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-zinc-500">
          About
        </p>
        <h3 className="mt-1 text-sm font-semibold leading-snug text-zinc-900 dark:text-zinc-50">
          {current.work.title}
        </h3>
        {current.work.subtitle && (
          <p className="mt-0.5 text-[11px] text-violet-600 dark:text-violet-400">
            {current.work.subtitle}
          </p>
        )}
        <p className="mt-1 text-[10px] text-zinc-500">
          {current.work.kind} · {current.work.year}
        </p>
        <p className="mt-0.5 text-[10px] text-zinc-400">
          目前：{current.clip.label}
        </p>
        {current.work.introSections?.length ? (
          <div className="mt-3 space-y-3 border-t border-zinc-200/80 pt-3 dark:border-zinc-800/80">
            {current.work.introSections.map((section) => (
              <div key={section.heading}>
                <p className="text-[10px] font-semibold tracking-wide text-zinc-800 dark:text-zinc-200">
                  {section.heading}
                </p>
                <p className="mt-1 whitespace-pre-line text-[11px] leading-relaxed text-zinc-600 dark:text-zinc-300">
                  {section.text}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-[11px] leading-relaxed text-zinc-600 dark:text-zinc-300">
            {current.work.description}
          </p>
        )}
      </aside>
    </div>
  );
}

type PlaylistGroupProps = {
  label: string;
  works: AudioTrack[];
  queue: QueueEntry[];
  flatIndex: number;
  expandable: boolean;
  openSlugs: Record<string, boolean>;
  onToggleWork: (slug: string) => void;
  onPlayWorkFirst: (slug: string) => void;
  onPickClip: (i: number) => void;
};

function PlaylistGroup({
  label,
  works,
  queue,
  flatIndex,
  expandable,
  openSlugs,
  onToggleWork,
  onPlayWorkFirst,
  onPickClip,
}: PlaylistGroupProps) {
  if (works.length === 0) return null;
  return (
    <div className="border-b border-zinc-100 px-1.5 py-2 last:border-b-0 dark:border-zinc-800/80">
      <p className="px-1.5 pb-1.5 text-[9px] font-semibold uppercase tracking-widest text-zinc-400">
        {label}
      </p>
      {works.map((work) => {
        const open = expandable ? (openSlugs[work.slug] ?? false) : true;
        const clips = work.clips?.length
          ? work.clips
          : [{ label: `${work.title}（尚無音檔）` }];

        if (!expandable) {
          return (
            <div
              key={work.slug}
              className="mb-1.5 rounded-lg border border-zinc-200/80 bg-zinc-50/80 dark:border-zinc-800 dark:bg-zinc-950/40"
            >
              <button
                type="button"
                onClick={() => onPlayWorkFirst(work.slug)}
                className="flex w-full items-center gap-2 px-2 py-2 text-left text-[11px] font-semibold text-zinc-800 transition hover:bg-zinc-100/90 dark:text-zinc-200 dark:hover:bg-zinc-800/60"
              >
                <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-[9px] text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">
                  ♪
                </span>
                <span className="min-w-0 flex-1 leading-snug">{work.title}</span>
              </button>
              <ul className="space-y-0.5 border-t border-zinc-200/70 px-1 pb-1.5 pt-1 dark:border-zinc-800/80">
                {clips.map((clip) => {
                  const qi = queue.findIndex(
                    (q) =>
                      q.work.slug === work.slug && q.clip.label === clip.label,
                  );
                  const active = qi === flatIndex;
                  const playable = Boolean(clip.url || clip.youtubeUrl);
                  return (
                    <li
                      key={`${work.slug}-${clip.label}-${clip.url ?? ""}-${clip.youtubeUrl ?? ""}`}
                    >
                      <button
                        type="button"
                        disabled={qi < 0}
                        onClick={() => onPickClip(qi)}
                        className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[11px] transition ${
                          active
                            ? "bg-violet-600 text-white shadow-sm dark:bg-violet-500"
                            : playable
                              ? "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
                              : "cursor-not-allowed text-zinc-400 dark:text-zinc-500"
                        }`}
                      >
                        <span
                          className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-bold ${
                            active
                              ? "bg-white/20 text-white"
                              : "bg-zinc-200 text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400"
                          }`}
                        >
                          {playable ? "♪" : "—"}
                        </span>
                        <span className="min-w-0 flex-1 truncate font-medium">
                          {clip.label}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        }

        return (
          <div
            key={work.slug}
            className="mb-1.5 rounded-lg border border-zinc-200/80 bg-zinc-50/80 dark:border-zinc-800 dark:bg-zinc-950/40"
          >
            <div className="flex w-full items-stretch gap-0.5">
              <button
                type="button"
                aria-expanded={open}
                aria-label={open ? "收合曲目" : "展開曲目"}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleWork(work.slug);
                }}
                className="inline-flex w-8 shrink-0 items-center justify-center rounded-l-lg border-r border-zinc-200/80 text-[11px] text-zinc-500 transition hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800/60"
              >
                {open ? "−" : "+"}
              </button>
              <button
                type="button"
                onClick={() => onPlayWorkFirst(work.slug)}
                className="min-w-0 flex-1 px-2 py-2 text-left text-[11px] font-semibold leading-snug text-zinc-800 transition hover:bg-zinc-100/90 dark:text-zinc-200 dark:hover:bg-zinc-800/60"
              >
                {work.title}
              </button>
            </div>
            {open ? (
              <ul className="space-y-0.5 border-t border-zinc-200/70 px-1 pb-1.5 pt-1 dark:border-zinc-800/80">
                {clips.map((clip) => {
                  const qi = queue.findIndex(
                    (q) =>
                      q.work.slug === work.slug && q.clip.label === clip.label,
                  );
                  const active = qi === flatIndex;
                  const playable = Boolean(clip.url || clip.youtubeUrl);
                  return (
                    <li
                      key={`${work.slug}-${clip.label}-${clip.url ?? ""}-${clip.youtubeUrl ?? ""}`}
                    >
                      <button
                        type="button"
                        disabled={qi < 0}
                        onClick={() => onPickClip(qi)}
                        className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[11px] transition ${
                          active
                            ? "bg-violet-600 text-white shadow-sm dark:bg-violet-500"
                            : playable
                              ? "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
                              : "cursor-not-allowed text-zinc-400 dark:text-zinc-500"
                        }`}
                      >
                        <span
                          className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-bold ${
                            active
                              ? "bg-white/20 text-white"
                              : "bg-zinc-200 text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400"
                          }`}
                        >
                          {playable ? "♪" : "—"}
                        </span>
                        <span className="min-w-0 flex-1 truncate font-medium">
                          {clip.label}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

type PlaybackDeckProps = {
  entry: QueueEntry;
  flatIndex: number;
  queueLength: number;
  autoplayTick: number;
  onPrev: () => void;
  onNext: () => void;
};

function PlaybackDeck({
  entry,
  flatIndex,
  queueLength,
  autoplayTick,
  onPrev,
  onNext,
}: PlaybackDeckProps) {
  const mode = deckMode(entry.clip);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [barDragging, setBarDragging] = useState(false);
  const scrubbingRef = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);

  const canPlayLocal =
    mode === "video" || mode === "cover-audio" || mode === "audio";
  const canPlay = mode === "youtube" || canPlayLocal;
  const canSeek = canPlayLocal && duration > 0;

  const timingMedia = (): HTMLMediaElement | null => {
    if (mode === "video") return videoRef.current;
    if (mode === "cover-audio" || mode === "audio") return audioRef.current;
    return null;
  };

  useEffect(() => {
    setIsPlaying(false);
    setProgress(0);
    setDuration(0);
    scrubbingRef.current = false;
    setBarDragging(false);
  }, [entry.work.slug, entry.clip.url, entry.clip.youtubeUrl]);

  useEffect(() => {
    if (autoplayTick === 0 || mode === "youtube" || mode === "none") return;
    let cancelled = false;
    const run = async () => {
      await new Promise((r) => requestAnimationFrame(() => r(undefined)));
      const el =
        mode === "video"
          ? videoRef.current
          : mode === "cover-audio" || mode === "audio"
            ? audioRef.current
            : null;
      if (!el || cancelled) return;
      try {
        await el.play();
        setIsPlaying(true);
      } catch {
        setIsPlaying(false);
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [autoplayTick, mode, entry.work.slug, entry.clip.url, entry.clip.youtubeUrl]);

  useEffect(() => {
    const el =
      mode === "video"
        ? videoRef.current
        : mode === "cover-audio" || mode === "audio"
          ? audioRef.current
          : null;
    if (!el) return;
    const onTime = () => {
      if (scrubbingRef.current) return;
      setProgress(el.currentTime);
      setDuration(Number.isFinite(el.duration) ? el.duration : 0);
    };
    const onEnded = () => setIsPlaying(false);
    el.addEventListener("timeupdate", onTime);
    el.addEventListener("loadedmetadata", onTime);
    el.addEventListener("durationchange", onTime);
    el.addEventListener("ended", onEnded);
    return () => {
      el.removeEventListener("timeupdate", onTime);
      el.removeEventListener("loadedmetadata", onTime);
      el.removeEventListener("durationchange", onTime);
      el.removeEventListener("ended", onEnded);
    };
  }, [entry.work.slug, entry.clip.url, mode]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v || mode !== "video") return;
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    v.addEventListener("play", onPlay);
    v.addEventListener("pause", onPause);
    return () => {
      v.removeEventListener("play", onPlay);
      v.removeEventListener("pause", onPause);
    };
  }, [mode, entry.clip.url]);

  const seekFromClientX = useCallback(
    (clientX: number) => {
      const bar = trackRef.current;
      const el =
        mode === "video"
          ? videoRef.current
          : mode === "cover-audio" || mode === "audio"
            ? audioRef.current
            : null;
      if (!bar || !el || !Number.isFinite(el.duration) || el.duration <= 0)
        return;
      const rect = bar.getBoundingClientRect();
      const ratio = Math.max(
        0,
        Math.min(1, (clientX - rect.left) / rect.width),
      );
      el.currentTime = ratio * el.duration;
      setProgress(el.currentTime);
      setDuration(el.duration);
    },
    [mode],
  );

  const onBarPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!canSeek) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    scrubbingRef.current = true;
    setBarDragging(true);
    seekFromClientX(e.clientX);
  };

  const onBarPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!scrubbingRef.current || !e.currentTarget.hasPointerCapture(e.pointerId))
      return;
    seekFromClientX(e.clientX);
  };

  const onBarPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    scrubbingRef.current = false;
    setBarDragging(false);
  };

  const togglePlay = async () => {
    if (mode === "youtube") return;
    const el = timingMedia();
    if (!el || !canPlayLocal) return;
    if (isPlaying) {
      el.pause();
      setIsPlaying(false);
      return;
    }
    try {
      await el.play();
      setIsPlaying(true);
    } catch {
      setIsPlaying(false);
    }
  };

  const pct =
    duration > 0 ? Math.min(100, (progress / duration) * 100) : 0;

  const embedBase = entry.clip.youtubeUrl
    ? youtubeEmbedSrc(entry.clip.youtubeUrl)
    : "";
  const embedSrc =
    embedBase && autoplayTick > 0
      ? `${embedBase}${embedBase.includes("?") ? "&" : "?"}autoplay=1`
      : embedBase;

  const squareStyle = {
    width: "min(260px, min(calc(100vw - 2rem), calc(100dvh - 15rem)))",
    height: "min(260px, min(calc(100vw - 2rem), calc(100dvh - 15rem)))",
  } as const;

  return (
    <section className="flex h-full max-h-full w-full max-w-[340px] flex-col justify-between overflow-hidden rounded-2xl border border-zinc-700/80 bg-gradient-to-b from-zinc-900 via-zinc-900 to-zinc-950 px-3 py-3 text-zinc-100 shadow-xl sm:max-w-[360px] sm:px-4 sm:py-4">
      {mode === "cover-audio" || mode === "audio" ? (
        <audio
          ref={audioRef}
          src={entry.clip.url}
          preload="metadata"
          onError={() => setIsPlaying(false)}
        />
      ) : null}

      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-violet-300/90">
          Now playing
        </p>
        <h2 className="mt-1 line-clamp-2 text-sm font-semibold leading-snug sm:text-base">
          {entry.work.title}
        </h2>
        <p className="mt-0.5 truncate text-xs text-violet-200/90 sm:text-sm">
          {entry.clip.label}
        </p>
        <p className="mt-1 text-[10px] text-zinc-400">
          {entry.work.kind} · {entry.work.year} · {flatIndex + 1} / {queueLength}
        </p>
      </div>

      <div className="my-2 flex shrink-0 justify-center sm:my-3">
        <div
          className="relative shrink-0 overflow-hidden rounded-2xl shadow-2xl ring-1 ring-white/10"
          style={squareStyle}
        >
          {mode === "youtube" && embedSrc ? (
            <iframe
              key={`${embedSrc}-${autoplayTick}`}
              title={entry.clip.label}
              src={embedSrc}
              className="h-full w-full bg-black"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : null}

          {mode === "video" && entry.clip.url ? (
            <>
              <video
                ref={videoRef}
                src={entry.clip.url}
                className="absolute inset-0 h-full w-full scale-105 object-cover"
                loop
                playsInline
                preload="metadata"
                onError={() => setIsPlaying(false)}
              />
              {entry.clip.glassImageUrl ? (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/20 p-5">
                  <div className="max-h-[78%] max-w-[82%] rounded-2xl border border-white/30 bg-white/15 p-3 shadow-2xl backdrop-blur-xl ring-1 ring-white/25">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={entry.clip.glassImageUrl}
                      alt=""
                      className="max-h-48 max-w-full object-contain"
                    />
                  </div>
                </div>
              ) : null}
            </>
          ) : null}

          {mode === "cover-audio" && entry.clip.coverImageUrl ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={entry.clip.coverImageUrl}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent"
                aria-hidden
              />
            </>
          ) : null}

          {mode === "audio" ? (
            <div
              className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-600/50 via-fuchsia-600/30 to-cyan-600/40"
              aria-hidden
            />
          ) : null}

          {mode === "none" ? (
            <div
              className="flex h-full w-full items-center justify-center bg-zinc-800 text-xs text-zinc-500"
              aria-hidden
            >
              無預覽
            </div>
          ) : null}
          {canPlayLocal ? (
            <button
              type="button"
              onClick={() => void togglePlay()}
              className="absolute inset-0 z-[5] cursor-pointer rounded-2xl border-0 bg-transparent p-0 outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900"
              aria-label={isPlaying ? "暫停" : "播放"}
            />
          ) : null}
        </div>
      </div>

      <div className="space-y-3 sm:space-y-4">
        {mode === "youtube" ? (
          <p className="text-center text-[10px] leading-relaxed text-zinc-500">
            進度與播放請在上方 YouTube 影片內操作。
          </p>
        ) : (
          <div>
            <div
              ref={trackRef}
              role="slider"
              aria-valuemin={0}
              aria-valuemax={duration > 0 ? duration : 0}
              aria-valuenow={progress}
              aria-disabled={!canSeek}
              onPointerDown={onBarPointerDown}
              onPointerMove={onBarPointerMove}
              onPointerUp={onBarPointerUp}
              onPointerCancel={onBarPointerUp}
              className={`relative h-3 w-full touch-none rounded-full bg-zinc-700/90 ${
                canSeek
                  ? "cursor-pointer"
                  : "cursor-not-allowed opacity-60"
              }`}
            >
              <div
                className={`pointer-events-none absolute inset-y-0 left-0 rounded-full bg-violet-400 ${
                  barDragging ? "" : "transition-[width] duration-100"
                }`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="mt-2 flex justify-between font-mono text-xs tabular-nums text-zinc-400">
              <span>{formatTime(progress)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        )}

        <div className="flex items-center justify-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onPrev}
            disabled={flatIndex <= 0}
            className="rounded-full border border-zinc-600 px-3 py-1.5 text-[10px] font-medium text-zinc-200 hover:bg-zinc-800 disabled:opacity-30 sm:px-4 sm:py-2 sm:text-xs"
          >
            上一段
          </button>
          <button
            type="button"
            onClick={togglePlay}
            disabled={!canPlayLocal}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-base font-bold text-zinc-900 shadow-lg hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-35 sm:h-12 sm:w-12 sm:text-lg"
            aria-label={isPlaying ? "暫停" : "播放"}
          >
            {isPlaying ? "❚❚" : "▶"}
          </button>
          <button
            type="button"
            onClick={onNext}
            disabled={flatIndex >= queueLength - 1}
            className="rounded-full border border-zinc-600 px-3 py-1.5 text-[10px] font-medium text-zinc-200 hover:bg-zinc-800 disabled:opacity-30 sm:px-4 sm:py-2 sm:text-xs"
          >
            下一段
          </button>
        </div>

        {!canPlay && (
          <p className="text-center text-xs text-zinc-500">此項目尚無音檔。</p>
        )}
      </div>
    </section>
  );
}

function formatTime(sec: number) {
  if (!Number.isFinite(sec) || sec < 0) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}
