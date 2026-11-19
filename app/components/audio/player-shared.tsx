"use client";

import { useSyncExternalStore } from "react";
import type { AudioClip, AudioTrack } from "@/lib/portfolio-data";
import { VIZ_MODES, type VizMode } from "@/lib/visualizers";

export function isVideoUrl(u: string) {
  return /\.(mov|mp4|webm|m4v|ogv)(\?.*)?$/i.test(u);
}

export function youtubeEmbedSrc(watchUrl: string): string {
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

export type DeckMode = "youtube" | "video" | "cover-audio" | "audio" | "none";

export function deckMode(clip: AudioClip): DeckMode {
  if (clip.youtubeUrl) return "youtube";
  if (!clip.url) return "none";
  if (isVideoUrl(clip.url)) return "video";
  if (clip.coverImageUrl) return "cover-audio";
  return "audio";
}

export function formatTime(sec: number) {
  if (!Number.isFinite(sec) || sec < 0) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function clipsOf(work: AudioTrack): AudioClip[] {
  return work.clips?.length ? work.clips : [{ label: `${work.title}（尚無音檔）` }];
}

export type QueueEntry = {
  work: AudioTrack;
  clip: AudioClip;
};

export function buildQueue(works: AudioTrack[]): QueueEntry[] {
  const out: QueueEntry[] = [];
  for (const work of works) {
    for (const clip of clipsOf(work)) out.push({ work, clip });
  }
  return out;
}

/* ── 視覺模式：存在 localStorage，伺服端一律是「聲環」 ── */

const VIZ_KEY = "nick-viz-mode";
const vizListeners = new Set<() => void>();

function readVizMode(): VizMode {
  try {
    const v = window.localStorage.getItem(VIZ_KEY);
    if (VIZ_MODES.some((m) => m.mode === v)) return v as VizMode;
  } catch {
    /* 無痕模式等情況讀不到 */
  }
  return "ring";
}

function writeVizMode(mode: VizMode) {
  try {
    window.localStorage.setItem(VIZ_KEY, mode);
  } catch {
    /* 存不了就只在這次瀏覽有效 */
  }
  memoryMode = mode;
  vizListeners.forEach((l) => l());
}

let memoryMode: VizMode | null = null;

export function useVizMode(): [VizMode, (m: VizMode) => void] {
  const mode = useSyncExternalStore(
    (cb) => {
      vizListeners.add(cb);
      return () => vizListeners.delete(cb);
    },
    () => memoryMode ?? readVizMode(),
    () => "ring" as VizMode,
  );
  return [mode, writeVizMode];
}

/* ── 小元件 ── */

export function EqBars() {
  return (
    <span className="flex h-3 w-3 items-end gap-[2px]" aria-hidden>
      <span className="eq-bar h-full w-[2px] bg-current" />
      <span className="eq-bar h-full w-[2px] bg-current [animation-delay:-0.3s]" />
      <span className="eq-bar h-full w-[2px] bg-current [animation-delay:-0.6s]" />
    </span>
  );
}

export function PlayGlyph() {
  return (
    <svg width="9" height="10" viewBox="0 0 9 10" aria-hidden>
      <path d="M1 0.8 L8.2 5 L1 9.2 Z" fill="currentColor" />
    </svg>
  );
}

export const WAVE_PATH = (() => {
  // 兩倍寬的正弦波，讓 translateX(-50%) 剛好平移一個畫面
  const pts: string[] = [];
  for (let x = 0; x <= 400; x += 4) {
    const env = Math.sin(((x % 200) / 200) * Math.PI);
    const y = 8 + Math.sin(x / 7) * 6 * env;
    pts.push(`${x === 0 ? "M" : "L"}${x} ${y.toFixed(2)}`);
  }
  return pts.join(" ");
})();


/** 清單展開／收合時掃過的一道聲波；key 變了就重播 */
export function WaveFlash({ tick, className = "" }: { tick: number; className?: string }) {
  if (tick <= 0) return null;
  return (
    <svg
      key={tick}
      className={`wave-flash pointer-events-none absolute inset-x-0 h-4 w-full text-paper ${className}`}
      viewBox="0 0 200 16"
      preserveAspectRatio="none"
      aria-hidden
    >
      <path d={WAVE_PATH} fill="none" stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

/** 依序切到下一個視覺模式 */
export function nextVizMode(mode: VizMode): VizMode {
  const i = VIZ_MODES.findIndex((m) => m.mode === mode);
  return VIZ_MODES[(i + 1) % VIZ_MODES.length]!.mode;
}
