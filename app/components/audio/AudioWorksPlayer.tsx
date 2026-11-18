"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import type { AudioClip, AudioTrack } from "@/lib/portfolio-data";
import { sortAudioTracks } from "@/lib/portfolio-data";
import { attachAnalyser } from "@/lib/audio-graph";
import { VIZ_MODES, type VizMode } from "@/lib/visualizers";
import { Visualizer } from "../Visualizer";

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

function formatTime(sec: number) {
  if (!Number.isFinite(sec) || sec < 0) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function clipsOf(work: AudioTrack): AudioClip[] {
  return work.clips?.length ? work.clips : [{ label: `${work.title}（尚無音檔）` }];
}

type QueueEntry = {
  work: AudioTrack;
  clip: AudioClip;
};

function buildQueue(works: AudioTrack[]): QueueEntry[] {
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

function useVizMode(): [VizMode, (m: VizMode) => void] {
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

function EqBars() {
  return (
    <span className="flex h-3 w-3 items-end gap-[2px]" aria-hidden>
      <span className="eq-bar h-full w-[2px] bg-current" />
      <span className="eq-bar h-full w-[2px] bg-current [animation-delay:-0.3s]" />
      <span className="eq-bar h-full w-[2px] bg-current [animation-delay:-0.6s]" />
    </span>
  );
}

function PlayGlyph() {
  return (
    <svg width="9" height="10" viewBox="0 0 9 10" aria-hidden>
      <path d="M1 0.8 L8.2 5 L1 9.2 Z" fill="currentColor" />
    </svg>
  );
}

const WAVE_PATH = (() => {
  // 兩倍寬的正弦波，讓 translateX(-50%) 剛好平移一個畫面
  const pts: string[] = [];
  for (let x = 0; x <= 400; x += 4) {
    const env = Math.sin(((x % 200) / 200) * Math.PI);
    const y = 8 + Math.sin(x / 7) * 6 * env;
    pts.push(`${x === 0 ? "M" : "L"}${x} ${y.toFixed(2)}`);
  }
  return pts.join(" ");
})();

/* ── 主元件 ── */

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
  const works = useMemo(() => sortAudioTracks(tracks), [tracks]);
  const queue = useMemo(() => buildQueue(works), [works]);

  const initialFlat = useMemo(() => {
    if (!initialSlug) return 0;
    const i = queue.findIndex((e) => e.work.slug === initialSlug);
    return i >= 0 ? i : 0;
  }, [queue, initialSlug]);

  const [flatIndex, setFlatIndex] = useState(initialFlat);
  const [deckPlaying, setDeckPlaying] = useState(false);
  const current = queue[flatIndex] ?? queue[0];

  const [openSlugs, setOpenSlugs] = useState<Record<string, boolean>>(() => {
    const slug = queue[initialFlat]?.work.slug;
    return slug ? { [slug]: true } : {};
  });
  const [waveTicks, setWaveTicks] = useState<Record<string, number>>({});

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
      const next = Math.max(0, Math.min(queue.length - 1, i));
      setFlatIndex(next);
      const slug = queue[next]?.work.slug;
      if (slug) setOpenSlugs((prev) => (prev[slug] ? prev : { ...prev, [slug]: true }));
    },
    [queue],
  );

  const pickAndPlay = useCallback(
    (i: number) => {
      goFlat(i);
      setAutoplayTick((n) => n + 1);
    },
    [goFlat],
  );

  // 展開／收合只改清單，不碰播放
  const toggleWork = useCallback((slug: string) => {
    setOpenSlugs((prev) => ({ ...prev, [slug]: !prev[slug] }));
    setWaveTicks((prev) => ({ ...prev, [slug]: (prev[slug] ?? 0) + 1 }));
  }, []);

  const playWork = useCallback(
    (slug: string) => {
      const qi = queue.findIndex((q) => q.work.slug === slug);
      if (qi >= 0) pickAndPlay(qi);
    },
    [queue, pickAndPlay],
  );

  // 依年份分段（置頂的作品自成一段時也照樣顯示年份）
  const yearGroups = useMemo(() => {
    const groups: { year: string; works: AudioTrack[] }[] = [];
    for (const w of works) {
      const last = groups[groups.length - 1];
      if (last && last.year === w.year) last.works.push(w);
      else groups.push({ year: w.year, works: [w] });
    }
    return groups;
  }, [works]);

  return (
    <div className="grid h-full min-h-0 w-full min-w-0 grid-rows-[minmax(0,20vh)_minmax(0,1fr)_minmax(0,16vh)] gap-3 lg:grid-cols-[minmax(0,17fr)_minmax(0,43fr)_minmax(0,25fr)] lg:grid-rows-1 lg:items-stretch lg:gap-6">
      <aside className="flex min-h-0 flex-col overflow-hidden bg-gradient-to-b from-white/[0.07] via-white/[0.025] to-transparent">
        <header className="flex shrink-0 items-baseline justify-between px-4 pt-4 pb-3">
          <h2 className="font-serif text-base text-paper">播放清單</h2>
          <p className="text-xs text-mute tabular-nums">{works.length} 件作品</p>
        </header>
        <div className="h-px shrink-0 bg-gradient-to-r from-white/30 via-white/10 to-transparent" />
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-6">
          {yearGroups.map((group, gi) => (
            <section key={`${group.year}-${gi}`}>
              <p className="px-4 pt-4 pb-1 text-[11px] text-mute tabular-nums">
                {group.year}
              </p>
              {group.works.map((work) => (
                <WorkRow
                  key={work.slug}
                  work={work}
                  queue={queue}
                  flatIndex={flatIndex}
                  playing={deckPlaying}
                  open={Boolean(openSlugs[work.slug])}
                  waveTick={waveTicks[work.slug] ?? 0}
                  onToggle={toggleWork}
                  onPlayWork={playWork}
                  onPickClip={pickAndPlay}
                />
              ))}
            </section>
          ))}
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

      <aside className="min-h-0 min-w-0 overflow-y-auto overscroll-contain bg-gradient-to-b from-white/[0.06] via-white/[0.02] to-transparent p-4 sm:p-5">
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
          <div className="mt-4 space-y-4 pt-4 [background:linear-gradient(to_right,rgba(255,255,255,0.25),transparent)_top/100%_1px_no-repeat]">
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

/* ── 播放清單的一件作品 ── */

type WorkRowProps = {
  work: AudioTrack;
  queue: QueueEntry[];
  flatIndex: number;
  playing: boolean;
  open: boolean;
  waveTick: number;
  onToggle: (slug: string) => void;
  onPlayWork: (slug: string) => void;
  onPickClip: (i: number) => void;
};

function WorkRow({
  work,
  queue,
  flatIndex,
  playing,
  open,
  waveTick,
  onToggle,
  onPlayWork,
  onPickClip,
}: WorkRowProps) {
  const clips = clipsOf(work);
  const current = queue[flatIndex];
  const here = current?.work.slug === work.slug;
  const known = clips.every((c) => typeof c.duration === "number");
  const total = clips.reduce((s, c) => s + (c.duration ?? 0), 0);
  const isVideo = clips.every((c) => c.youtubeUrl || (c.url && isVideoUrl(c.url)));
  const panelId = `clips-${work.slug}`;

  return (
    <div className="relative">
      <span
        className={`absolute inset-y-0 left-0 w-px bg-paper transition-opacity duration-300 ${here ? "opacity-100" : "opacity-0"}`}
        aria-hidden
      />
      <div className="relative flex items-center">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => onToggle(work.slug)}
          className={`flex min-w-0 flex-1 items-center gap-3 py-2.5 pr-2 pl-4 text-left transition-colors ${
            here ? "bg-gradient-to-r from-white/[0.08] to-transparent" : "hover:bg-gradient-to-r hover:from-white/[0.05] hover:to-transparent"
          }`}
        >
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13px] leading-snug text-paper">
              {work.title}
            </span>
            <span className="block truncate text-[11px] leading-snug text-mute">
              {work.subtitle ?? work.kind}
            </span>
          </span>
          <span className="shrink-0 text-right text-[11px] leading-snug text-mute tabular-nums">
            <span className="block">{clips.length} 段</span>
            <span className="block">
              {known && total > 0 ? formatTime(total) : isVideo ? "影片" : "—"}
            </span>
          </span>
        </button>
        <button
          type="button"
          onClick={() => onPlayWork(work.slug)}
          aria-label={`播放 ${work.title}`}
          className="mr-3 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/25 text-paper transition-colors hover:border-paper hover:bg-paper hover:text-ink"
        >
          {here && playing ? <EqBars /> : <PlayGlyph />}
        </button>
        {waveTick > 0 ? (
          <svg
            key={waveTick}
            className="wave-flash pointer-events-none absolute inset-x-0 -bottom-2 h-4 w-full text-paper"
            viewBox="0 0 200 16"
            preserveAspectRatio="none"
            aria-hidden
          >
            <path d={WAVE_PATH} fill="none" stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          </svg>
        ) : null}
      </div>

      <div
        id={panelId}
        className={`grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.2,0.7,0.2,1)] motion-reduce:transition-none ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <ul className="overflow-hidden" inert={!open}>
          {clips.map((clip, i) => {
            const qi = queue.findIndex(
              (q) => q.work.slug === work.slug && q.clip.label === clip.label,
            );
            const active = qi === flatIndex;
            const playable = Boolean(clip.url || clip.youtubeUrl);
            return (
              <li key={`${work.slug}-${clip.label}-${clip.url ?? ""}-${clip.youtubeUrl ?? ""}`}>
                <button
                  type="button"
                  disabled={qi < 0 || !playable}
                  onClick={() => onPickClip(qi)}
                  aria-current={active ? "true" : undefined}
                  className={`group relative flex w-full items-center gap-3 py-1.5 pr-3 pl-6 text-left text-xs transition-colors disabled:cursor-not-allowed ${
                    active
                      ? "bg-gradient-to-r from-white/[0.16] via-white/[0.05] to-transparent text-paper"
                      : "text-mute hover:bg-gradient-to-r hover:from-white/[0.06] hover:to-transparent hover:text-paper"
                  }`}
                >
                  <span
                    className={`absolute inset-y-0 left-0 w-0.5 bg-paper ${active ? "" : "hidden"}`}
                    aria-hidden
                  />
                  <span className="w-5 shrink-0 text-[11px] text-mute tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="min-w-0 flex-1 truncate">{clip.label}</span>
                  <span className="shrink-0 text-[11px] text-mute tabular-nums">
                    {typeof clip.duration === "number"
                      ? formatTime(clip.duration)
                      : clip.youtubeUrl
                        ? "YouTube"
                        : "—"}
                  </span>
                  <span
                    className={`flex w-3 shrink-0 justify-center transition-opacity ${
                      active ? "opacity-100" : "opacity-40 group-hover:opacity-100"
                    }`}
                  >
                    {active && playing ? <EqBars /> : <PlayGlyph />}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
      <div className="mx-4 h-px bg-gradient-to-r from-white/15 via-white/5 to-transparent" />
    </div>
  );
}

/* ── 中央播放器 ── */

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
  const [vizMode, setVizMode] = useVizMode();
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
  const showsViz = mode === "audio" || mode === "cover-audio";

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

  const getBins = useCallback(() => {
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

  // 父層是 size container，用 cqw/cqh 讓影片維持 16:9
  const videoStyle = {
    width: "min(760px, 100cqw, calc(100cqh * 16 / 9))",
    aspectRatio: "16 / 9",
  } as const;

  return (
    <section className="flex h-full max-h-full w-full max-w-[min(100%,680px)] flex-col justify-between overflow-hidden text-paper">
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

      <div className="relative my-2 flex min-h-[160px] flex-1 items-center justify-center [container-type:size]">
        {showsViz ? (
          <div className="absolute inset-0">
            {mode === "cover-audio" && entry.clip.coverImageUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={entry.clip.coverImageUrl}
                alt=""
                className={`absolute top-1/2 left-1/2 aspect-square w-[min(70cqw,70cqh)] -translate-x-1/2 -translate-y-1/2 object-cover grayscale transition-opacity duration-700 [mask-image:radial-gradient(circle,black_25%,transparent_68%)] ${
                  isPlaying ? "opacity-30" : "opacity-60"
                }`}
              />
            ) : null}
            <Visualizer
              mode={vizMode}
              getBins={getBins}
              radius={0.3}
              density={110}
              respectReducedMotion={false}
            />
          </div>
        ) : null}

        {mode === "youtube" && embedSrc ? (
          <div className="relative bg-black" style={videoStyle}>
            <iframe
              key={`${embedSrc}-${autoplayTick}`}
              title={entry.clip.label}
              src={embedSrc}
              className="absolute inset-0 h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        ) : null}

        {mode === "video" && entry.clip.url ? (
          <div className="relative overflow-hidden bg-black" style={videoStyle}>
            <video
              ref={videoRef}
              src={entry.clip.url}
              className="absolute inset-0 h-full w-full object-cover"
              loop
              playsInline
              preload="metadata"
              onError={() => setIsPlaying(false)}
            />
            <button
              type="button"
              onClick={() => void togglePlay()}
              className="absolute inset-0 z-[5] cursor-pointer border-0 bg-transparent p-0"
              aria-label={isPlaying ? "暫停" : "播放"}
            />
          </div>
        ) : null}

        {mode === "none" ? (
          <p className="text-xs text-mute">無預覽</p>
        ) : null}

        {showsViz ? (
          <button
            type="button"
            onClick={() => void togglePlay()}
            className="absolute inset-0 z-[5] cursor-pointer border-0 bg-transparent p-0"
            aria-label={isPlaying ? "暫停" : "播放"}
          />
        ) : null}
      </div>

      {showsViz ? (
        <div
          role="group"
          aria-label="視覺模式"
          className="mb-3 flex justify-center gap-5 text-xs"
        >
          {VIZ_MODES.map((m) => (
            <button
              key={m.mode}
              type="button"
              aria-pressed={vizMode === m.mode}
              onClick={() => setVizMode(m.mode)}
              className={`underline-offset-[6px] transition-colors ${
                vizMode === m.mode
                  ? "text-paper underline decoration-1"
                  : "text-mute hover:text-paper"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      ) : null}

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
              <div className="h-px w-full bg-gradient-to-r from-white/10 via-white/25 to-white/10" />
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
