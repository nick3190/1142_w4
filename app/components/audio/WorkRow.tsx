"use client";

import type { AudioTrack } from "@/lib/portfolio-data";
import {
  EqBars,
  PlayGlyph,
  WaveFlash,
  clipsOf,
  formatTime,
  isVideoUrl,
  type QueueEntry,
} from "./player-shared";

/** 桌機版播放清單的一件作品：點整列展開／收合，右側按鈕才播放 */


export type WorkRowProps = {
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

export function WorkRow({
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
        <WaveFlash tick={waveTick} className="-bottom-2" />
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

