"use client";

import type { ReactNode } from "react";
import type { VizMode } from "@/lib/visualizers";
import { Visualizer } from "../Visualizer";
import { formatTime, type QueueEntry } from "./player-shared";
import type { Playback, TrackRef, VideoRef } from "./usePlayback";

/* ── 畫面：視覺化／影片／YouTube ── */

type StageProps = {
  pb: Playback;
  videoRef: VideoRef;
  entry: QueueEntry;
  vizMode: VizMode;
  /** 點畫面切到下一個視覺模式；背景模式下由上層清單負責 */
  onCycle?: () => void;
  variant: "desktop" | "background";
  autoplayTick: number;
};

export function Stage({ pb, videoRef, entry, vizMode, onCycle, variant, autoplayTick }: StageProps) {
  const { mode } = pb;
  const videoStyle = {
    width: "min(760px, 100cqw, calc(100cqh * 16 / 9))",
    aspectRatio: "16 / 9",
  } as const;

  return (
    <div className="relative flex h-full w-full items-center justify-center [container-type:size]">
      {pb.showsViz ? (
        <div className="absolute inset-0">
          {mode === "cover-audio" && entry.clip.coverImageUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={entry.clip.coverImageUrl}
              alt=""
              className={`absolute top-1/2 left-1/2 aspect-square w-[min(70cqw,70cqh)] -translate-x-1/2 -translate-y-1/2 object-cover grayscale transition-opacity duration-700 [mask-image:radial-gradient(circle,black_25%,transparent_68%)] ${
                pb.isPlaying ? "opacity-30" : "opacity-60"
              }`}
            />
          ) : null}
          <div key={vizMode} className="viz-swap absolute inset-0">
            <Visualizer
              mode={vizMode}
              getBins={pb.getBins}
              radius={variant === "background" ? 0.34 : 0.3}
              centerY={variant === "background" ? 0.42 : 0.5}
              density={110}
              respectReducedMotion={false}
            />
          </div>
          {onCycle ? (
            <button
              type="button"
              onClick={onCycle}
              className="absolute inset-0 z-[5] cursor-pointer border-0 bg-transparent p-0"
              aria-label="切換視覺效果"
            />
          ) : null}
        </div>
      ) : null}

      {mode === "youtube" && pb.embedSrc && variant === "desktop" ? (
        <div className="relative bg-black" style={videoStyle}>
          <iframe
            key={`${pb.embedSrc}-${autoplayTick}`}
            title={entry.clip.label}
            src={pb.embedSrc}
            className="absolute inset-0 h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      ) : null}

      {mode === "video" && entry.clip.url ? (
        <div className="relative overflow-hidden bg-black" style={videoStyle}>
          <video
            key={entry.clip.url}
            ref={videoRef}
            src={entry.clip.url}
            className="absolute inset-0 h-full w-full object-cover"
            loop
            playsInline
            preload="metadata"
          />
          {variant === "desktop" ? (
            <button
              type="button"
              onClick={() => void pb.togglePlay()}
              className="absolute inset-0 z-[5] cursor-pointer border-0 bg-transparent p-0"
              aria-label={pb.isPlaying ? "暫停" : "播放"}
            />
          ) : null}
        </div>
      ) : null}

      {mode === "none" ? <p className="text-xs text-mute">無預覽</p> : null}
    </div>
  );
}

/* ── 進度條與播放鍵 ── */

type TransportProps = {
  pb: Playback;
  trackRef: TrackRef;
  flatIndex: number;
  queueLength: number;
  onPrev: () => void;
  onNext: () => void;
  /** 控制列右側的額外按鈕（手機版的「介紹」） */
  aside?: ReactNode;
};

export function Transport({ pb, trackRef, flatIndex, queueLength, onPrev, onNext, aside }: TransportProps) {
  return (
    <div className="space-y-3">
      {pb.mode === "youtube" ? (
        <p className="text-center text-xs leading-relaxed text-mute">
          進度與播放請在 YouTube 影片內操作。
        </p>
      ) : (
        <div>
          <div
            ref={trackRef}
            role="slider"
            tabIndex={pb.canSeek ? 0 : -1}
            aria-label="播放進度"
            aria-valuemin={0}
            aria-valuemax={pb.duration > 0 ? Math.round(pb.duration) : 0}
            aria-valuenow={Math.round(pb.progress)}
            aria-valuetext={`${formatTime(pb.progress)}／${formatTime(pb.duration)}`}
            aria-disabled={!pb.canSeek}
            onPointerDown={pb.barHandlers.onPointerDown}
            onPointerMove={pb.barHandlers.onPointerMove}
            onPointerUp={pb.barHandlers.onPointerUp}
            onPointerCancel={pb.barHandlers.onPointerUp}
            onKeyDown={pb.barHandlers.onKeyDown}
            className={`group relative flex h-4 w-full touch-none items-center ${
              pb.canSeek ? "cursor-pointer" : "cursor-not-allowed opacity-50"
            }`}
          >
            <div className="h-px w-full bg-gradient-to-r from-white/10 via-white/25 to-white/10" />
            <div
              className={`pointer-events-none absolute left-0 h-px bg-paper ${
                pb.barDragging ? "" : "transition-[width] duration-100"
              }`}
              style={{ width: `${pb.pct}%` }}
            />
            <div
              className="pointer-events-none absolute h-2.5 w-px -translate-x-1/2 bg-paper"
              style={{ left: `${pb.pct}%` }}
            />
          </div>
          <div className="mt-1 flex justify-between text-xs text-mute tabular-nums">
            <span>{formatTime(pb.progress)}</span>
            <span>{formatTime(pb.duration)}</span>
          </div>
        </div>
      )}

      <div className="relative flex items-center justify-center gap-6">
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
          onClick={() => void pb.togglePlay()}
          disabled={!pb.canPlayLocal}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-paper text-paper transition-colors hover:bg-paper hover:text-ink disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-paper"
          aria-label={pb.isPlaying ? "暫停" : "播放"}
        >
          {pb.isPlaying ? (
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
        {aside ? <div className="absolute right-0">{aside}</div> : null}
      </div>
    </div>
  );
}

/* ── 作品介紹內文（桌機右欄與手機的上拉面板共用） ── */

export function WorkInfo({ entry }: { entry: QueueEntry }) {
  const w = entry.work;
  return (
    <>
      <h3 className="font-serif text-lg leading-snug text-paper">{w.title}</h3>
      {w.subtitle && <p className="mt-1 text-sm text-paper/80">{w.subtitle}</p>}
      <p className="mt-2 flex gap-3 text-xs text-mute">
        <span>{w.kind}</span>
        <span>{w.year}</span>
      </p>
      {w.introSections?.length ? (
        <div className="mt-4 space-y-4 pt-4 [background:linear-gradient(to_right,rgba(255,255,255,0.25),transparent)_top/100%_1px_no-repeat]">
          {w.introSections.map((section) => (
            <div key={section.heading}>
              <p className="text-xs text-paper">{section.heading}</p>
              <p className="mt-1 whitespace-pre-line text-[13px] leading-relaxed text-mute">
                {section.text}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-[13px] leading-relaxed text-mute">{w.description}</p>
      )}
    </>
  );
}
