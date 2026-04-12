"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { AudioTrack } from "@/lib/portfolio-data";

type AudioWorksPlayerProps = {
  tracks: AudioTrack[];
  initialSlug?: string;
};

export function AudioWorksPlayer({ tracks, initialSlug }: AudioWorksPlayerProps) {
  const initialIndex = useMemo(() => {
    if (!initialSlug) return 0;
    const i = tracks.findIndex((t) => t.slug === initialSlug);
    return i >= 0 ? i : 0;
  }, [tracks, initialSlug]);

  const [index, setIndex] = useState(initialIndex);
  const current = tracks[index] ?? tracks[0];

  const selectTrack = useCallback((i: number) => {
    setIndex(i);
  }, []);

  const grouped = useMemo(() => {
    const score = tracks.filter((t) => t.kind === "配樂");
    const sound = tracks.filter((t) => t.kind === "聲音設計");
    return { score, sound };
  }, [tracks]);

  return (
    <div className="grid min-h-[min(70vh,640px)] grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-0 lg:rounded-2xl lg:border lg:border-zinc-200/80 lg:dark:border-zinc-800/80 lg:overflow-hidden">
      {/* 左：播放清單 */}
      <aside className="flex max-h-[50vh] flex-col rounded-2xl border border-zinc-200/80 bg-white/80 dark:border-zinc-800/80 dark:bg-zinc-950/70 lg:col-span-3 lg:max-h-none lg:rounded-none lg:border-0 lg:border-r">
        <div className="border-b border-zinc-200/80 px-4 py-3 text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
          播放清單
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          <TrackGroup
            label="配樂"
            items={grouped.score}
            tracks={tracks}
            activeIndex={index}
            onPick={selectTrack}
          />
          <TrackGroup
            label="聲音設計"
            items={grouped.sound}
            tracks={tracks}
            activeIndex={index}
            onPick={selectTrack}
          />
        </div>
      </aside>

      {/* 中：播放器（依曲目 key 重掛，避免在 effect 內同步 reset state） */}
      <PlaybackDeck
        key={current.slug}
        track={current}
        canGoPrev={index > 0}
        canGoNext={index < tracks.length - 1}
        onPrev={() => selectTrack(Math.max(0, index - 1))}
        onNext={() => selectTrack(Math.min(tracks.length - 1, index + 1))}
      />

      {/* 右：專案介紹 */}
      <aside className="rounded-2xl border border-zinc-200/80 bg-white/80 p-6 dark:border-zinc-800/80 dark:bg-zinc-950/70 lg:col-span-4 lg:rounded-none lg:border-0 lg:p-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
          專案介紹
        </p>
        <p className="mt-4 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
          {current.description}
        </p>
      </aside>
    </div>
  );
}

type PlaybackDeckProps = {
  track: AudioTrack;
  canGoPrev: boolean;
  canGoNext: boolean;
  onPrev: () => void;
  onNext: () => void;
};

function PlaybackDeck({
  track,
  canGoPrev,
  canGoNext,
  onPrev,
  onNext,
}: PlaybackDeckProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canPlay = Boolean(track.audioUrl);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    el.pause();
    if (track.audioUrl) {
      el.src = track.audioUrl;
    } else {
      el.removeAttribute("src");
    }
    el.load();
  }, [track.audioUrl, track.slug]);

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
  }, [track.slug]);

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
    <section className="flex flex-col justify-between gap-6 rounded-2xl border border-zinc-200/80 bg-white/90 p-6 dark:border-zinc-800/80 dark:bg-zinc-950/80 lg:col-span-5 lg:rounded-none lg:border-0 lg:border-r lg:px-8 lg:py-10">
      <audio ref={audioRef} preload="metadata" />
      <div>
        <p className="text-xs font-medium uppercase tracking-widest text-violet-600 dark:text-violet-400">
          正在瀏覽
        </p>
        <h2 className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl">
          {track.title}
        </h2>
        {track.subtitle && (
          <p className="mt-1 text-sm text-zinc-500">{track.subtitle}</p>
        )}
        <p className="mt-2 text-xs text-zinc-500">
          {track.kind} · {track.year}
        </p>
      </div>
      <div className="space-y-4">
        <div className="aspect-square max-w-[220px] rounded-2xl bg-gradient-to-br from-violet-500/30 via-fuchsia-500/20 to-cyan-500/25 shadow-inner ring-1 ring-black/5 dark:ring-white/10" />
        <div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
            <div
              className="h-full rounded-full bg-violet-500 transition-[width] duration-150 dark:bg-violet-400"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="mt-1 flex justify-between text-[11px] tabular-nums text-zinc-500">
            <span>{formatTime(progress)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onPrev}
            disabled={!canGoPrev}
            className="rounded-full border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            上一首
          </button>
          <button
            type="button"
            onClick={togglePlay}
            disabled={!canPlay}
            className="rounded-full bg-zinc-900 px-6 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
          >
            {isPlaying ? "暫停" : "播放"}
          </button>
          <button
            type="button"
            onClick={onNext}
            disabled={!canGoNext}
            className="rounded-full border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            下一首
          </button>
        </div>
        {!canPlay && (
          <p className="text-xs leading-relaxed text-zinc-500">
            尚未設定音檔網址。請在{" "}
            <code className="rounded bg-zinc-200 px-1 py-0.5 text-[10px] dark:bg-zinc-800">
              lib/portfolio-data.ts
            </code>{" "}
            為此曲目的{" "}
            <code className="rounded bg-zinc-200 px-1 py-0.5 text-[10px] dark:bg-zinc-800">
              audioUrl
            </code>{" "}
            填入可公開存取的音檔連結後即可播放。
          </p>
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

type TrackGroupProps = {
  label: string;
  items: AudioTrack[];
  tracks: AudioTrack[];
  activeIndex: number;
  onPick: (index: number) => void;
};

function TrackGroup({
  label,
  items,
  tracks,
  activeIndex,
  onPick,
}: TrackGroupProps) {
  if (items.length === 0) return null;
  return (
    <div className="mb-4">
      <p className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
        {label}
      </p>
      <ul className="space-y-0.5">
        {items.map((t) => {
          const i = tracks.indexOf(t);
          const active = i === activeIndex;
          return (
            <li key={t.slug}>
              <button
                type="button"
                onClick={() => onPick(i)}
                className={`flex w-full flex-col items-start rounded-xl px-3 py-2 text-left text-xs transition sm:text-sm ${
                  active
                    ? "bg-violet-600 text-white shadow-md dark:bg-violet-500"
                    : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800/80"
                }`}
              >
                <span className="font-medium">{t.title}</span>
                <span
                  className={
                    active ? "text-violet-100" : "text-zinc-500 dark:text-zinc-400"
                  }
                >
                  {t.year}
                  {t.audioUrl ? "" : " · 待上傳音檔"}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
