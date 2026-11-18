"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { AudioClip, AudioTrack } from "@/lib/portfolio-data";
import { attachAnalyser } from "@/lib/audio-graph";
import { ParticleRing } from "../ParticleRing";

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
  const [deckPlaying, setDeckPlaying] = useState(false);
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
    <div className="grid h-full min-h-0 w-full min-w-0 grid-rows-[minmax(0,18vh)_minmax(0,1fr)_minmax(0,16vh)] gap-2 lg:grid-cols-[minmax(0,15fr)_minmax(0,45fr)_minmax(0,25fr)] lg:grid-rows-1 lg:items-stretch lg:gap-4">
      <aside className="flex min-h-0 flex-col overflow-hidden border border-line">
        <h2 className="shrink-0 border-b border-line px-3 py-2 text-sm text-paper">
          播放清單
        </h2>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <PlaylistGroup
            label="配樂"
            works={score}
            queue={queue}
            flatIndex={flatIndex}
            playing={deckPlaying}
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
            playing={deckPlaying}
            expandable={false}
            openSlugs={openSlugs}
            onToggleWork={toggleWorkOpen}
            onPlayWorkFirst={playWorkFirst}
            onPickClip={pickAndPlay}
          />
        </div>
      </aside>

      <div className="flex min-h-0 min-w-0 justify-center">
        <PlaybackDeck
          key={`${current.work.slug}-${current.clip.label}-${current.clip.url ?? ""}-${current.clip.youtubeUrl ?? ""}`}
          entry={current}
          flatIndex={flatIndex}
          queueLength={queue.length}
          autoplayTick={autoplayTick}
          onPrev={() => goFlat(flatIndex - 1)}
          onNext={() => goFlat(flatIndex + 1)}
          onPlayingChange={setDeckPlaying}
        />
      </div>

      <aside className="min-h-0 min-w-0 overflow-y-auto overscroll-contain border border-line p-3 sm:p-4">
        <h3 className="font-serif text-lg leading-snug text-paper">
          {current.work.title}
        </h3>
        {current.work.subtitle && (
          <p className="mt-1 text-sm text-paper/80">{current.work.subtitle}</p>
        )}
        <p className="mt-2 flex gap-3 text-xs text-mute">
          <span>{current.work.kind}</span>
          <span>{current.work.year}</span>
        </p>
        {current.work.introSections?.length ? (
          <div className="mt-4 space-y-4 border-t border-line pt-4">
            {current.work.introSections.map((section) => (
              <div key={section.heading}>
                <p className="text-xs text-paper">{section.heading}</p>
                <p className="mt-1 whitespace-pre-line text-[13px] leading-relaxed text-mute">
                  {section.text}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-[13px] leading-relaxed text-mute">
            {current.work.description}
          </p>
        )}
      </aside>
    </div>
  );
}

function PlayingMark({ active, playing }: { active: boolean; playing: boolean }) {
  if (active && playing) {
    return (
      <span className="flex h-3 w-3 shrink-0 items-end gap-[2px]" aria-hidden>
        <span className="eq-bar h-full w-[2px] bg-current" />
        <span className="eq-bar h-full w-[2px] bg-current [animation-delay:-0.3s]" />
        <span className="eq-bar h-full w-[2px] bg-current [animation-delay:-0.6s]" />
      </span>
    );
  }
  return (
    <span
      className={`h-1 w-1 shrink-0 rounded-full ${active ? "bg-current" : "bg-line"}`}
      aria-hidden
    />
  );
}

type PlaylistGroupProps = {
  label: string;
  works: AudioTrack[];
  queue: QueueEntry[];
  flatIndex: number;
  playing: boolean;
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
  playing,
  expandable,
  openSlugs,
  onToggleWork,
  onPlayWorkFirst,
  onPickClip,
}: PlaylistGroupProps) {
  if (works.length === 0) return null;
  return (
    <div className="border-b border-line py-2 last:border-b-0">
      <p className="px-3 pb-1 text-xs text-mute">{label}</p>
      {works.map((work) => {
        const open = expandable ? (openSlugs[work.slug] ?? false) : true;
        const clips = work.clips?.length
          ? work.clips
          : [{ label: `${work.title}（尚無音檔）` }];

        if (!expandable) {
          return (
            <div key={work.slug}>
              {clips.map((clip) => {
                const qi = queue.findIndex(
                  (q) =>
                    q.work.slug === work.slug && q.clip.label === clip.label,
                );
                const active = qi === flatIndex;
                const playable = Boolean(clip.url || clip.youtubeUrl);
                return (
                  <button
                    key={`${work.slug}-${clip.label}-${clip.url ?? ""}-${clip.youtubeUrl ?? ""}`}
                    type="button"
                    disabled={qi < 0}
                    onClick={() => onPickClip(qi)}
                    aria-current={active ? "true" : undefined}
                    className={`flex w-full items-center gap-2.5 px-3 py-1.5 text-left transition-colors ${
                      active
                        ? "bg-paper text-ink"
                        : playable
                          ? "text-paper hover:bg-faint"
                          : "cursor-not-allowed text-mute"
                    }`}
                  >
                    <PlayingMark active={active} playing={playing} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] leading-snug">
                        {work.title}
                      </span>
                      <span
                        className={`block truncate text-[11px] leading-snug ${active ? "text-ink/70" : "text-mute"}`}
                      >
                        {clip.label}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          );
        }

        return (
          <div key={work.slug}>
            <div className="flex w-full items-stretch">
              <button
                type="button"
                aria-expanded={open}
                aria-label={open ? `收合 ${work.title}` : `展開 ${work.title}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleWork(work.slug);
                }}
                className="inline-flex w-8 shrink-0 items-center justify-center text-sm text-mute transition-colors hover:text-paper"
              >
                {open ? "−" : "+"}
              </button>
              <button
                type="button"
                onClick={() => onPlayWorkFirst(work.slug)}
                className="min-w-0 flex-1 truncate py-1.5 pr-3 text-left text-[13px] leading-snug text-paper transition-colors hover:text-mute"
              >
                {work.title}
              </button>
            </div>
            {open ? (
              <ul className="pb-1">
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
                        aria-current={active ? "true" : undefined}
                        className={`flex w-full items-center gap-2.5 py-1 pr-3 pl-8 text-left text-xs transition-colors ${
                          active
                            ? "bg-paper text-ink"
                            : playable
                              ? "text-mute hover:bg-faint hover:text-paper"
                              : "cursor-not-allowed text-line"
                        }`}
                      >
                        <PlayingMark active={active} playing={playing} />
                        <span className="min-w-0 flex-1 truncate">
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
  onPlayingChange: (playing: boolean) => void;
};

function PlaybackDeck({
  entry,
  flatIndex,
  queueLength,
  autoplayTick,
  onPrev,
  onNext,
  onPlayingChange,
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

  // 即時頻譜
  const analyserRef = useRef<AnalyserNode | null>(null);
  const freqRef = useRef<Uint8Array<ArrayBuffer> | null>(null);
  const playingRef = useRef(false);

  const canPlayLocal =
    mode === "video" || mode === "cover-audio" || mode === "audio";
  const canPlay = mode === "youtube" || canPlayLocal;
  const canSeek = canPlayLocal && duration > 0;
  const showsRing = mode === "audio" || mode === "cover-audio";

  const timingMedia = (): HTMLMediaElement | null => {
    if (mode === "video") return videoRef.current;
    if (mode === "cover-audio" || mode === "audio") return audioRef.current;
    return null;
  };

  useEffect(() => {
    playingRef.current = isPlaying;
    onPlayingChange(isPlaying);
  }, [isPlaying, onPlayingChange]);

  useEffect(() => {
    return () => onPlayingChange(false);
  }, [onPlayingChange]);

  const connectAnalyser = useCallback((el: HTMLMediaElement | null) => {
    if (!el || analyserRef.current) return;
    void attachAnalyser(el).then((a) => {
      if (!a) return;
      analyserRef.current = a;
      freqRef.current = new Uint8Array(a.frequencyBinCount);
    });
  }, []);

  const getSpectrum = useCallback(() => {
    const a = analyserRef.current;
    const buf = freqRef.current;
    if (!a || !buf || !playingRef.current) return null;
    a.getByteFrequencyData(buf);
    return buf;
  }, []);

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
    const onPlay = () => {
      setIsPlaying(true);
      if (mode !== "video") connectAnalyser(el);
    };
    const onPause = () => setIsPlaying(false);
    el.addEventListener("timeupdate", onTime);
    el.addEventListener("loadedmetadata", onTime);
    el.addEventListener("durationchange", onTime);
    el.addEventListener("ended", onEnded);
    el.addEventListener("play", onPlay);
    el.addEventListener("pause", onPause);
    return () => {
      el.removeEventListener("timeupdate", onTime);
      el.removeEventListener("loadedmetadata", onTime);
      el.removeEventListener("durationchange", onTime);
      el.removeEventListener("ended", onEnded);
      el.removeEventListener("play", onPlay);
      el.removeEventListener("pause", onPause);
    };
  }, [entry.work.slug, entry.clip.url, mode, connectAnalyser]);

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

  const onBarKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const el = timingMedia();
    if (!el || !canSeek) return;
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      const step = e.key === "ArrowRight" ? 5 : -5;
      el.currentTime = Math.max(0, Math.min(el.duration, el.currentTime + step));
      setProgress(el.currentTime);
    }
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
    // 在點擊的同步段落裡喚醒 AudioContext
    if (mode !== "video") connectAnalyser(el);
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

  // 父層是 size container，用 cqw/cqh 讓視窗在可用空間內保持正方形／16:9
  const squareStyle = {
    width: "min(420px, 100cqw, 100cqh)",
    height: "min(420px, 100cqw, 100cqh)",
  } as const;
  const videoStyle = {
    width: "min(760px, 100cqw, calc(100cqh * 16 / 9))",
    aspectRatio: "16 / 9",
  } as const;
  const useVideoFrame = mode === "youtube" || mode === "video";

  return (
    <section className="flex h-full max-h-full w-full max-w-[min(100%,540px)] flex-col justify-between overflow-hidden border border-line bg-faint px-3 py-3 text-paper sm:px-4 sm:py-4">
      {mode === "cover-audio" || mode === "audio" ? (
        <audio
          ref={audioRef}
          src={entry.clip.url}
          preload="metadata"
          onError={() => setIsPlaying(false)}
        />
      ) : null}

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="line-clamp-2 font-serif text-lg leading-snug break-words sm:text-xl">
            {entry.work.title}
          </h2>
          <p className="mt-0.5 truncate text-sm text-mute">{entry.clip.label}</p>
        </div>
        <p className="shrink-0 pt-1 text-xs text-mute tabular-nums">
          {flatIndex + 1}／{queueLength}
        </p>
      </div>

      <div className="my-3 flex min-h-[120px] flex-1 items-center justify-center [container-type:size]">
        <div
          className="relative shrink-0 overflow-hidden bg-ink"
          style={useVideoFrame ? videoStyle : squareStyle}
        >
          {mode === "youtube" && embedSrc ? (
            <iframe
              key={`${embedSrc}-${autoplayTick}`}
              title={entry.clip.label}
              src={embedSrc}
              className="absolute inset-0 h-full w-full bg-black"
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
                  <div className="max-h-[78%] max-w-[82%] border border-white/25 bg-white/10 p-3 backdrop-blur-xl">
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
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={entry.clip.coverImageUrl}
              alt=""
              className={`absolute inset-0 h-full w-full object-cover grayscale transition-opacity duration-700 ${
                isPlaying ? "opacity-25" : "opacity-60"
              }`}
            />
          ) : null}

          {showsRing ? (
            <div className="absolute inset-0">
              <ParticleRing
                getSpectrum={getSpectrum}
                trail={mode === "audio"}
                radius={0.27}
                density={110}
                respectReducedMotion={false}
              />
            </div>
          ) : null}

          {mode === "none" ? (
            <div
              className="flex h-full w-full items-center justify-center text-xs text-mute"
              aria-hidden
            >
              無預覽
            </div>
          ) : null}
          {canPlayLocal ? (
            <button
              type="button"
              onClick={() => void togglePlay()}
              className="absolute inset-0 z-[5] cursor-pointer border-0 bg-transparent p-0"
              aria-label={isPlaying ? "暫停" : "播放"}
            />
          ) : null}
        </div>
      </div>

      <div className="space-y-3">
        {mode === "youtube" ? (
          <p className="text-center text-xs leading-relaxed text-mute">
            進度與播放請在上方 YouTube 影片內操作。
          </p>
        ) : (
          <div>
            <div
              ref={trackRef}
              role="slider"
              tabIndex={canSeek ? 0 : -1}
              aria-label="播放進度"
              aria-valuemin={0}
              aria-valuemax={duration > 0 ? Math.round(duration) : 0}
              aria-valuenow={Math.round(progress)}
              aria-valuetext={`${formatTime(progress)}／${formatTime(duration)}`}
              aria-disabled={!canSeek}
              onPointerDown={onBarPointerDown}
              onPointerMove={onBarPointerMove}
              onPointerUp={onBarPointerUp}
              onPointerCancel={onBarPointerUp}
              onKeyDown={onBarKeyDown}
              className={`group relative flex h-4 w-full touch-none items-center ${
                canSeek ? "cursor-pointer" : "cursor-not-allowed opacity-50"
              }`}
            >
              <div className="h-px w-full bg-line" />
              <div
                className={`pointer-events-none absolute left-0 h-px bg-paper ${
                  barDragging ? "" : "transition-[width] duration-100"
                }`}
                style={{ width: `${pct}%` }}
              />
              <div
                className="pointer-events-none absolute h-2.5 w-px -translate-x-1/2 bg-paper"
                style={{ left: `${pct}%` }}
              />
            </div>
            <div className="mt-1 flex justify-between text-xs text-mute tabular-nums">
              <span>{formatTime(progress)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        )}

        <div className="flex items-center justify-center gap-6">
          <button
            type="button"
            onClick={onPrev}
            disabled={flatIndex <= 0}
            className="shrink-0 text-sm text-mute transition-colors hover:text-paper disabled:opacity-30 disabled:hover:text-mute"
          >
            上一段
          </button>
          <button
            type="button"
            onClick={togglePlay}
            disabled={!canPlayLocal}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-paper text-paper transition-colors hover:bg-paper hover:text-ink disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-paper"
            aria-label={isPlaying ? "暫停" : "播放"}
          >
            {isPlaying ? (
              <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
                <rect x="2" y="1" width="2.5" height="10" fill="currentColor" />
                <rect x="7.5" y="1" width="2.5" height="10" fill="currentColor" />
              </svg>
            ) : (
              <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
                <path d="M3 1 L11 6 L3 11 Z" fill="currentColor" />
              </svg>
            )}
          </button>
          <button
            type="button"
            onClick={onNext}
            disabled={flatIndex >= queueLength - 1}
            className="shrink-0 text-sm text-mute transition-colors hover:text-paper disabled:opacity-30 disabled:hover:text-mute"
          >
            下一段
          </button>
        </div>

        {!canPlay && (
          <p className="text-center text-xs text-mute">此項目尚無音檔。</p>
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
