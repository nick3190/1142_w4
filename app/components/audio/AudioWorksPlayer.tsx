"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { AudioClip, AudioTrack } from "@/lib/portfolio-data";

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
        clip: { label: `${work.title}（尚無音檔）`, url: "" },
      });
    }
  }
  return out;
}

type AudioWorksPlayerProps = {
  tracks: AudioTrack[];
  initialSlug?: string;
};

export function AudioWorksPlayer({ tracks, initialSlug }: AudioWorksPlayerProps) {
  const queue = useMemo(() => buildQueue(tracks), [tracks]);

  const initialFlat = useMemo(() => {
    if (!initialSlug) return 0;
    const i = queue.findIndex((e) => e.work.slug === initialSlug);
    return i >= 0 ? i : 0;
  }, [queue, initialSlug]);

  const [flatIndex, setFlatIndex] = useState(initialFlat);
  const current = queue[flatIndex] ?? queue[0];

  const goFlat = useCallback(
    (i: number) => {
      if (queue.length === 0) return;
      setFlatIndex(Math.max(0, Math.min(queue.length - 1, i)));
    },
    [queue.length],
  );

  const score = useMemo(() => tracks.filter((t) => t.kind === "配樂"), [tracks]);
  const sound = useMemo(() => tracks.filter((t) => t.kind === "聲音設計"), [tracks]);

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200/90 bg-zinc-100 shadow-xl dark:border-zinc-800 dark:bg-zinc-950">
      <div className="grid min-h-[min(78vh,720px)] grid-cols-1 lg:grid-cols-12">
        <aside className="flex max-h-[42vh] flex-col border-b border-zinc-200 bg-white/95 dark:border-zinc-800 dark:bg-zinc-900/95 lg:col-span-4 lg:max-h-none lg:border-b-0 lg:border-r">
          <div className="border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
              Queue
            </p>
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              播放清單
            </p>
          </div>
          <div className="flex-1 overflow-y-auto overscroll-contain">
            <PlaylistGroup
              label="配樂"
              works={score}
              queue={queue}
              flatIndex={flatIndex}
              onPick={goFlat}
            />
            <PlaylistGroup
              label="聲音設計"
              works={sound}
              queue={queue}
              flatIndex={flatIndex}
              onPick={goFlat}
            />
          </div>
        </aside>

        <PlaybackDeck
          key={`${current.work.slug}-${current.clip.label}-${current.clip.url}`}
          entry={current}
          flatIndex={flatIndex}
          queueLength={queue.length}
          onPrev={() => goFlat(flatIndex - 1)}
          onNext={() => goFlat(flatIndex + 1)}
        />

        <aside className="border-t border-zinc-200 bg-white/95 p-6 dark:border-zinc-800 dark:bg-zinc-900/95 lg:col-span-3 lg:border-t-0 lg:border-l">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
            About
          </p>
          <h3 className="mt-2 text-base font-semibold text-zinc-900 dark:text-zinc-50">
            {current.work.title}
          </h3>
          {current.work.subtitle && (
            <p className="mt-1 text-xs text-violet-600 dark:text-violet-400">
              {current.work.subtitle}
            </p>
          )}
          <p className="mt-2 text-xs text-zinc-500">
            {current.work.kind} · {current.work.year}
          </p>
          <p className="mt-4 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
            {current.work.description}
          </p>
        </aside>
      </div>
    </div>
  );
}

type PlaylistGroupProps = {
  label: string;
  works: AudioTrack[];
  queue: QueueEntry[];
  flatIndex: number;
  onPick: (i: number) => void;
};

function PlaylistGroup({
  label,
  works,
  queue,
  flatIndex,
  onPick,
}: PlaylistGroupProps) {
  if (works.length === 0) return null;
  return (
    <div className="border-b border-zinc-100 px-2 py-3 last:border-b-0 dark:border-zinc-800/80">
      <p className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
        {label}
      </p>
      {works.map((work) => (
        <div key={work.slug} className="mb-3">
          <p className="truncate px-2 text-xs font-semibold text-zinc-800 dark:text-zinc-200">
            {work.title}
          </p>
          <ul className="mt-1 space-y-0.5">
            {(work.clips?.length
              ? work.clips
              : [{ label: `${work.title}（尚無音檔）`, url: "" }]
            ).map((clip) => {
              const qi = queue.findIndex(
                (q) =>
                  q.work.slug === work.slug && q.clip.label === clip.label,
              );
              const active = qi === flatIndex;
              const playable = Boolean(clip.url);
              return (
                <li key={`${work.slug}-${clip.label}-${clip.url}`}>
                  <button
                    type="button"
                    disabled={qi < 0}
                    onClick={() => onPick(qi)}
                    className={`flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-xs transition sm:text-sm ${
                      active
                        ? "bg-violet-600 text-white shadow-md dark:bg-violet-500"
                        : playable
                          ? "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
                          : "cursor-not-allowed text-zinc-400 dark:text-zinc-500"
                    }`}
                  >
                    <span
                      className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
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
      ))}
    </div>
  );
}

type PlaybackDeckProps = {
  entry: QueueEntry;
  flatIndex: number;
  queueLength: number;
  onPrev: () => void;
  onNext: () => void;
};

function PlaybackDeck({
  entry,
  flatIndex,
  queueLength,
  onPrev,
  onNext,
}: PlaybackDeckProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canPlay = Boolean(entry.clip.url);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    const onTime = () => {
      setProgress(el.currentTime);
      setDuration(el.duration || 0);
    };
    const onEnded = () => setIsPlaying(false);
    el.addEventListener("timeupdate", onTime);
    el.addEventListener("loadedmetadata", onTime);
    el.addEventListener("ended", onEnded);
    return () => {
      el.removeEventListener("timeupdate", onTime);
      el.removeEventListener("loadedmetadata", onTime);
      el.removeEventListener("ended", onEnded);
    };
  }, [entry.work.slug, entry.clip.url]);

  const togglePlay = async () => {
    const el = audioRef.current;
    if (!el || !canPlay) return;
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

  return (
    <section className="flex flex-col justify-between bg-gradient-to-b from-zinc-900 via-zinc-900 to-zinc-950 px-6 py-8 text-zinc-100 lg:col-span-5 lg:px-10 lg:py-10">
      {canPlay ? (
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
        <h2 className="mt-2 text-lg font-semibold leading-snug sm:text-xl">
          {entry.work.title}
        </h2>
        <p className="mt-1 truncate text-sm text-violet-200/90">{entry.clip.label}</p>
        <p className="mt-2 text-xs text-zinc-400">
          {entry.work.kind} · {entry.work.year} · {flatIndex + 1} / {queueLength}
        </p>
      </div>

      <div className="my-8 flex justify-center">
        <div className="aspect-square w-[min(240px,70vw)] max-w-[260px] rounded-2xl bg-gradient-to-br from-violet-600/50 via-fuchsia-600/30 to-cyan-600/40 shadow-2xl ring-1 ring-white/10" />
      </div>

      <div className="space-y-5">
        <div>
          <div className="h-2 w-full cursor-pointer overflow-hidden rounded-full bg-zinc-700">
            <div
              className="h-full rounded-full bg-violet-400 transition-[width] duration-100"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="mt-2 flex justify-between font-mono text-xs tabular-nums text-zinc-400">
            <span>{formatTime(progress)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={onPrev}
            disabled={flatIndex <= 0}
            className="rounded-full border border-zinc-600 px-4 py-2 text-xs font-medium text-zinc-200 hover:bg-zinc-800 disabled:opacity-30"
          >
            上一段
          </button>
          <button
            type="button"
            onClick={togglePlay}
            disabled={!canPlay}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-lg font-bold text-zinc-900 shadow-lg hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-35"
            aria-label={isPlaying ? "暫停" : "播放"}
          >
            {isPlaying ? "❚❚" : "▶"}
          </button>
          <button
            type="button"
            onClick={onNext}
            disabled={flatIndex >= queueLength - 1}
            className="rounded-full border border-zinc-600 px-4 py-2 text-xs font-medium text-zinc-200 hover:bg-zinc-800 disabled:opacity-30"
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
