"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import type { AudioTrack } from "@/lib/portfolio-data";
import { sortAudioTracks } from "@/lib/portfolio-data";
import { MobilePlayer } from "./MobilePlayer";
import { Stage, Transport, WorkInfo } from "./PlayerParts";
import { buildQueue, nextVizMode, useVizMode } from "./player-shared";
import { usePlayback } from "./usePlayback";
import { WorkRow } from "./WorkRow";

const MOBILE_QUERY = "(max-width: 1023px)";

function useIsMobile() {
  return useSyncExternalStore(
    (cb) => {
      const m = window.matchMedia(MOBILE_QUERY);
      m.addEventListener("change", cb);
      return () => m.removeEventListener("change", cb);
    },
    () => window.matchMedia(MOBILE_QUERY).matches,
    () => false,
  );
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
  const isMobile = useIsMobile();
  const works = useMemo(() => sortAudioTracks(tracks), [tracks]);
  const queue = useMemo(() => buildQueue(works), [works]);

  const initialFlat = useMemo(() => {
    if (!initialSlug) return 0;
    const i = queue.findIndex((e) => e.work.slug === initialSlug);
    return i >= 0 ? i : 0;
  }, [queue, initialSlug]);

  const [flatIndex, setFlatIndex] = useState(initialFlat);
  const [deckPlaying, setDeckPlaying] = useState(false);
  const current = queue[flatIndex] ?? queue[0]!;
  const [vizMode, setVizMode] = useVizMode();
  const cycleViz = useCallback(() => setVizMode(nextVizMode(vizMode)), [vizMode, setVizMode]);

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

  const [pb, audioRef, videoRef, trackRef] = usePlayback(current, autoplayTick, setDeckPlaying);

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

  const yearGroups = useMemo(() => {
    const groups: { year: string; works: AudioTrack[] }[] = [];
    for (const w of works) {
      const last = groups[groups.length - 1];
      if (last && last.year === w.year) last.works.push(w);
      else groups.push({ year: w.year, works: [w] });
    }
    return groups;
  }, [works]);

  const entryKey = `${current.work.slug}-${current.clip.label}-${current.clip.url ?? ""}`;
  const onPrev = () => goFlat(flatIndex - 1);
  const onNext = () => goFlat(flatIndex + 1);

  return (
    <>
      {/* 一首一個 <audio>，放在版面外層：切換手機／桌機版面時不會中斷播放 */}
      {pb.mode === "audio" || pb.mode === "cover-audio" ? (
        <audio key={entryKey} ref={audioRef} src={current.clip.url} preload="metadata" />
      ) : null}

      {isMobile ? (
        <MobilePlayer
          works={works}
          queue={queue}
          flatIndex={flatIndex}
          openSlugs={openSlugs}
          waveTicks={waveTicks}
          onToggle={toggleWork}
          onPickClip={pickAndPlay}
          pb={pb}
          videoRef={videoRef}
          trackRef={trackRef}
          entry={current}
          vizMode={vizMode}
          onCycle={cycleViz}
          autoplayTick={autoplayTick}
          onPrev={onPrev}
          onNext={onNext}
        />
      ) : (
        <div className="grid h-full min-h-0 w-full min-w-0 grid-cols-[minmax(0,17fr)_minmax(0,43fr)_minmax(0,25fr)] gap-6">
          <aside className="flex min-h-0 flex-col overflow-hidden bg-gradient-to-b from-white/[0.07] via-white/[0.025] to-transparent">
            <header className="flex shrink-0 items-baseline justify-between px-4 pt-4 pb-3">
              <h2 className="font-serif text-base text-paper">播放清單</h2>
              <p className="text-xs text-mute tabular-nums">{works.length} 件作品</p>
            </header>
            <div className="h-px shrink-0 bg-gradient-to-r from-white/30 via-white/10 to-transparent" />
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-6">
              {yearGroups.map((group, gi) => (
                <section key={`${group.year}-${gi}`}>
                  <p className="px-4 pt-4 pb-1 text-[11px] text-mute tabular-nums">{group.year}</p>
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

          <section className="flex h-full min-h-0 min-w-0 flex-col justify-between overflow-hidden text-paper">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h2 className="line-clamp-2 font-serif text-xl leading-snug break-words">
                  {current.work.title}
                </h2>
                <p className="mt-0.5 truncate text-sm text-mute">{current.clip.label}</p>
              </div>
              <p className="shrink-0 pt-1 text-xs text-mute tabular-nums">
                {flatIndex + 1}／{queue.length}
              </p>
            </div>
            <div className="my-3 min-h-[160px] flex-1">
              <Stage
                pb={pb}
                videoRef={videoRef}
                entry={current}
                vizMode={vizMode}
                onCycle={cycleViz}
                variant="desktop"
                autoplayTick={autoplayTick}
              />
            </div>
            <Transport
              pb={pb}
              trackRef={trackRef}
              flatIndex={flatIndex}
              queueLength={queue.length}
              onPrev={onPrev}
              onNext={onNext}
            />
          </section>

          <aside className="min-h-0 min-w-0 overflow-y-auto overscroll-contain bg-gradient-to-b from-white/[0.06] via-white/[0.02] to-transparent p-5">
            <WorkInfo entry={current} />
          </aside>
        </div>
      )}
    </>
  );
}
