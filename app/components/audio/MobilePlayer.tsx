"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { AudioClip, AudioTrack } from "@/lib/portfolio-data";
import type { VizMode } from "@/lib/visualizers";
import { Stage, Transport, WorkInfo } from "./PlayerParts";
import {
  EqBars,
  WaveFlash,
  clipsOf,
  formatTime,
  isVideoUrl,
  type QueueEntry,
} from "./player-shared";
import type { Playback, TrackRef, VideoRef } from "./usePlayback";

type WheelItem =
  | { kind: "work"; key: string; work: AudioTrack }
  | { kind: "clip"; key: string; work: AudioTrack; clip: AudioClip; qi: number; n: number };

type MobilePlayerProps = {
  works: AudioTrack[];
  queue: QueueEntry[];
  flatIndex: number;
  openSlugs: Record<string, boolean>;
  waveTicks: Record<string, number>;
  onToggle: (slug: string) => void;
  onPickClip: (i: number) => void;
  pb: Playback;
  videoRef: VideoRef;
  trackRef: TrackRef;
  entry: QueueEntry;
  vizMode: VizMode;
  onCycle: () => void;
  autoplayTick: number;
  onPrev: () => void;
  onNext: () => void;
};

/**
 * 手機版：動畫鋪滿當背景，上面疊一層 20% 黑幕和滾輪式的播放清單；
 * 點清單以外的空白處切換視覺效果，作品介紹從底部往上拉出。
 */
export function MobilePlayer(props: MobilePlayerProps) {
  const { pb, videoRef, trackRef, entry, vizMode, autoplayTick } = props;
  const [infoOpen, setInfoOpen] = useState(false);

  return (
    <div className="relative h-full overflow-hidden">
      <div className="absolute inset-0">
        <Stage
          pb={pb}
          videoRef={videoRef}
          entry={entry}
          vizMode={vizMode}
          variant="background"
          autoplayTick={autoplayTick}
        />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-black/20" aria-hidden />

      <div className="relative z-10 flex h-full flex-col">
        <WheelList {...props} className="min-h-0 flex-1" />

        {pb.mode === "youtube" && pb.embedSrc ? (
          <div className="mx-4 mb-3 aspect-video shrink-0 bg-black">
            <iframe
              key={`${pb.embedSrc}-${autoplayTick}`}
              title={entry.clip.label}
              src={pb.embedSrc}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        ) : null}

        <div className="shrink-0 px-5 pt-1 pb-4">
          <Transport
            pb={pb}
            trackRef={trackRef}
            flatIndex={props.flatIndex}
            queueLength={props.queue.length}
            onPrev={props.onPrev}
            onNext={props.onNext}
            aside={
              <button
                type="button"
                onClick={() => setInfoOpen(true)}
                aria-expanded={infoOpen}
                aria-controls="mobile-work-info"
                className="text-sm text-mute transition-colors hover:text-paper"
              >
                介紹
              </button>
            }
          />
        </div>
      </div>

      {/* 上拉面板：點面板外收合 */}
      <div
        className={`absolute inset-0 z-20 bg-black/40 transition-opacity duration-300 ${
          infoOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setInfoOpen(false)}
        aria-hidden
      />
      <section
        id="mobile-work-info"
        aria-label="作品介紹"
        inert={!infoOpen}
        className={`absolute inset-x-0 bottom-0 z-30 max-h-[72%] overflow-y-auto overscroll-contain rounded-t-2xl bg-gradient-to-b from-neutral-900/95 to-black/95 px-5 pt-3 pb-8 backdrop-blur-md transition-transform duration-500 ease-[cubic-bezier(0.2,0.7,0.2,1)] motion-reduce:transition-none ${
          infoOpen ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="mb-4 flex items-center justify-between">
          <span className="h-1 w-10 rounded-full bg-white/25" aria-hidden />
          <button
            type="button"
            onClick={() => setInfoOpen(false)}
            className="text-sm text-mute transition-colors hover:text-paper"
          >
            收合
          </button>
        </div>
        <WorkInfo entry={entry} />
      </section>
    </div>
  );
}

/* ── 滾輪式清單 ── */

function WheelList({
  works,
  queue,
  flatIndex,
  openSlugs,
  waveTicks,
  onToggle,
  onPickClip,
  pb,
  onCycle,
  className = "",
}: MobilePlayerProps & { className?: string }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const firstCenter = useRef(true);
  const current = queue[flatIndex];

  const items = useMemo(() => {
    const out: WheelItem[] = [];
    for (const work of works) {
      out.push({ kind: "work", key: `w-${work.slug}`, work });
      if (!openSlugs[work.slug]) continue;
      clipsOf(work).forEach((clip, n) => {
        const qi = queue.findIndex(
          (q) => q.work.slug === work.slug && q.clip.label === clip.label,
        );
        out.push({ kind: "clip", key: `c-${work.slug}-${n}`, work, clip, qi, n });
      });
    }
    return out;
  }, [works, openSlugs, queue]);

  // 依距離中線的遠近，讓每一列放大／縮小、往前／往後倒
  const updateWheel = useRef<() => void>(() => {});
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const rect = el.getBoundingClientRect();
      const mid = rect.top + rect.height / 2;
      const half = Math.max(1, rect.height / 2);
      el.querySelectorAll<HTMLElement>("[data-wheel]").forEach((row) => {
        const r = row.getBoundingClientRect();
        const d = Math.max(-1, Math.min(1, (r.top + r.height / 2 - mid) / half));
        const near = 1 - Math.abs(d);
        const inner = row.firstElementChild as HTMLElement | null;
        if (!inner) return;
        inner.style.transform = `perspective(700px) rotateX(${(-d * 38).toFixed(1)}deg) scale(${(0.8 + 0.38 * near * near).toFixed(3)})`;
        inner.style.opacity = (0.2 + 0.8 * Math.pow(near, 1.3)).toFixed(3);
      });
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    updateWheel.current = schedule;
    update();
    el.addEventListener("scroll", schedule, { passive: true });
    const ro = new ResizeObserver(schedule);
    ro.observe(el);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("scroll", schedule);
      ro.disconnect();
    };
  }, []);

  // 清單內容變了（展開／收合）也要重算
  useEffect(() => {
    updateWheel.current();
  }, [items]);

  // 只有換曲目時才把它捲到中線；展開／收合清單不動捲動位置
  const centeredFor = useRef<number | null>(null);
  useEffect(() => {
    if (centeredFor.current === flatIndex) return;
    const el = ref.current;
    const row = el?.querySelector<HTMLElement>('[data-current="true"]');
    if (!el || !row) return;
    centeredFor.current = flatIndex;
    const top = row.offsetTop - el.clientHeight / 2 + row.offsetHeight / 2;
    el.scrollTo({ top, behavior: firstCenter.current ? "auto" : "smooth" });
    firstCenter.current = false;
  }, [flatIndex, items]);

  return (
    <div
      ref={ref}
      onClick={(e) => {
        // 點到列以外的空白處 → 切換視覺效果
        if (!(e.target as HTMLElement).closest("button")) onCycle();
      }}
      className={`no-scrollbar relative overflow-y-auto overscroll-contain [container-type:size] [mask-image:linear-gradient(to_bottom,transparent,black_22%,black_78%,transparent)] ${className}`}
    >
      <div className="h-[42cqh]" aria-hidden />
      {items.map((item) => {
        if (item.kind === "work") {
          const clips = clipsOf(item.work);
          const here = current?.work.slug === item.work.slug;
          const known = clips.every((c) => typeof c.duration === "number");
          const total = clips.reduce((s, c) => s + (c.duration ?? 0), 0);
          const isVideo = clips.every((c) => c.youtubeUrl || (c.url && isVideoUrl(c.url)));
          return (
            <div
              key={item.key}
              data-wheel
              data-current={here && !openSlugs[item.work.slug] ? "true" : undefined}
              className="relative px-5 py-1.5"
            >
              <div className="origin-left will-change-transform">
                <button
                  type="button"
                  aria-expanded={Boolean(openSlugs[item.work.slug])}
                  onClick={() => onToggle(item.work.slug)}
                  className="relative inline-flex max-w-full flex-col items-start text-left"
                >
                  <span className={`font-serif text-xl leading-tight ${here ? "text-paper" : "text-paper/85"}`}>
                    {here ? <span className="mr-2 inline-block h-3 w-px bg-paper align-middle" aria-hidden /> : null}
                    {item.work.title}
                  </span>
                  <span className="mt-0.5 flex flex-wrap gap-x-3 text-[11px] text-mute tabular-nums">
                    <span>{item.work.year}</span>
                    <span>{item.work.subtitle ?? item.work.kind}</span>
                    <span>{clips.length} 段</span>
                    <span>{known && total > 0 ? formatTime(total) : isVideo ? "影片" : "—"}</span>
                  </span>
                  <WaveFlash tick={waveTicks[item.work.slug] ?? 0} className="-bottom-3" />
                </button>
              </div>
            </div>
          );
        }
        const active = item.qi === flatIndex;
        const playable = Boolean(item.clip.url || item.clip.youtubeUrl);
        return (
          <div
            key={item.key}
            data-wheel
            data-current={active ? "true" : undefined}
            className="py-1 pr-5 pl-9"
          >
            <div className="origin-left will-change-transform">
              <button
                type="button"
                disabled={item.qi < 0 || !playable}
                aria-current={active ? "true" : undefined}
                onClick={() => onPickClip(item.qi)}
                className={`inline-flex max-w-full items-center gap-3 text-left text-sm disabled:opacity-40 ${
                  active ? "text-paper" : "text-paper/70"
                }`}
              >
                <span className="text-[11px] text-mute tabular-nums">
                  {String(item.n + 1).padStart(2, "0")}
                </span>
                <span className="truncate">{item.clip.label}</span>
                <span className="text-[11px] text-mute tabular-nums">
                  {typeof item.clip.duration === "number"
                    ? formatTime(item.clip.duration)
                    : item.clip.youtubeUrl
                      ? "YouTube"
                      : ""}
                </span>
                {active && pb.isPlaying ? <EqBars /> : null}
              </button>
            </div>
          </div>
        );
      })}
      <div className="h-[42cqh]" aria-hidden />
    </div>
  );
}
