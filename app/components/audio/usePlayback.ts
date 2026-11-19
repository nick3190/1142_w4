"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { attachAnalyser } from "@/lib/audio-graph";
import { deckMode, youtubeEmbedSrc, type QueueEntry } from "./player-shared";

type Graph = { el: HTMLMediaElement; analyser: AnalyserNode; buf: Uint8Array<ArrayBuffer> };

/**
 * 播放狀態與控制。<audio> 由外層依曲目 key 重新掛載，
 * 影片元素則在畫面元件裡；兩者都透過這裡的 ref 操作。
 */
export function usePlayback(
  entry: QueueEntry,
  autoplayTick: number,
  onPlayingChange: (playing: boolean) => void,
) {
  const mode = deckMode(entry.clip);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [barDragging, setBarDragging] = useState(false);
  const scrubbingRef = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const graphRef = useRef<Graph | null>(null);
  const playingRef = useRef(false);

  const canPlayLocal =
    mode === "video" || mode === "cover-audio" || mode === "audio";
  const canSeek = canPlayLocal && duration > 0;
  const showsViz = mode === "audio" || mode === "cover-audio";

  const media = useCallback((): HTMLMediaElement | null => {
    if (mode === "video") return videoRef.current;
    if (mode === "cover-audio" || mode === "audio") return audioRef.current;
    return null;
  }, [mode]);

  useEffect(() => {
    playingRef.current = isPlaying;
    onPlayingChange(isPlaying);
  }, [isPlaying, onPlayingChange]);

  useEffect(() => () => onPlayingChange(false), [onPlayingChange]);

  // 每個 <audio> 只接一次分析器；換曲目時元素是新的，就重新接
  const connectAnalyser = useCallback((el: HTMLMediaElement | null) => {
    if (!el || graphRef.current?.el === el) return;
    void attachAnalyser(el).then((a) => {
      if (!a) return;
      graphRef.current = { el, analyser: a, buf: new Uint8Array(a.frequencyBinCount) };
    });
  }, []);

  const getBins = useCallback(() => {
    const g = graphRef.current;
    if (!g || !playingRef.current || g.el !== audioRef.current) return null;
    g.analyser.getByteFrequencyData(g.buf);
    return g.buf;
  }, []);

  // 換曲目時重設狀態：在 render 中比對上一首（React 建議的寫法，不另跑 effect）
  const entryKey = `${entry.work.slug}|${entry.clip.url ?? ""}|${entry.clip.youtubeUrl ?? ""}`;
  const [lastKey, setLastKey] = useState(entryKey);
  if (lastKey !== entryKey) {
    setLastKey(entryKey);
    setIsPlaying(false);
    setProgress(0);
    setDuration(0);
    setBarDragging(false);
  }
  useEffect(() => {
    scrubbingRef.current = false;
  }, [entryKey]);

  useEffect(() => {
    if (autoplayTick === 0 || mode === "youtube" || mode === "none") return;
    let cancelled = false;
    const run = async () => {
      await new Promise((r) => requestAnimationFrame(() => r(undefined)));
      const el = media();
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
  }, [autoplayTick, mode, media, entry.work.slug, entry.clip.url, entry.clip.youtubeUrl]);

  useEffect(() => {
    const el = media();
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
  }, [entry.work.slug, entry.clip.url, mode, media, connectAnalyser]);

  const seekFromClientX = useCallback(
    (clientX: number) => {
      const bar = trackRef.current;
      const el = media();
      if (!bar || !el || !Number.isFinite(el.duration) || el.duration <= 0)
        return;
      const rect = bar.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      el.currentTime = ratio * el.duration;
      setProgress(el.currentTime);
      setDuration(el.duration);
    },
    [media],
  );

  const barHandlers = {
    onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => {
      if (!canSeek) return;
      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);
      scrubbingRef.current = true;
      setBarDragging(true);
      seekFromClientX(e.clientX);
    },
    onPointerMove: (e: React.PointerEvent<HTMLDivElement>) => {
      if (!scrubbingRef.current || !e.currentTarget.hasPointerCapture(e.pointerId))
        return;
      seekFromClientX(e.clientX);
    },
    onPointerUp: (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
      scrubbingRef.current = false;
      setBarDragging(false);
    },
    onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => {
      const el = media();
      if (!el || !canSeek) return;
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        e.preventDefault();
        const step = e.key === "ArrowRight" ? 5 : -5;
        el.currentTime = Math.max(0, Math.min(el.duration, el.currentTime + step));
        setProgress(el.currentTime);
      }
    },
  };

  const togglePlay = async () => {
    const el = media();
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

  const embedBase = entry.clip.youtubeUrl ? youtubeEmbedSrc(entry.clip.youtubeUrl) : "";
  const embedSrc =
    embedBase && autoplayTick > 0
      ? `${embedBase}${embedBase.includes("?") ? "&" : "?"}autoplay=1`
      : embedBase;

  const pb = {
    mode,
    isPlaying,
    progress,
    duration,
    barDragging,
    canPlayLocal,
    canSeek,
    showsViz,
    getBins,
    togglePlay,
    barHandlers,
    embedSrc,
    pct: duration > 0 ? Math.min(100, (progress / duration) * 100) : 0,
  };
  // ref 與狀態分開回傳：狀態物件裡混了 ref，React 編譯器會把整包當成 ref 看待
  return [pb, audioRef, videoRef, trackRef] as const;
}

export type Playback = ReturnType<typeof usePlayback>[0];
export type VideoRef = ReturnType<typeof usePlayback>[2];
export type TrackRef = ReturnType<typeof usePlayback>[3];
